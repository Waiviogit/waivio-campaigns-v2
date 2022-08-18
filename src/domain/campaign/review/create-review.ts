import { Inject, Injectable } from '@nestjs/common';
import {
  APP_PROVIDE,
  CAMPAIGN_PAYMENT,
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  GUEST_BNF_ACC,
  PAYOUT_TOKEN_PRECISION,
  REDIS_DAYS_TO_SUSPEND,
  REDIS_EXPIRE,
  REFERRAL_TYPES,
  REGEX_WOBJECT_REF,
  RESERVATION_STATUS,
  REVIEW_PROVIDE,
  SPONSORS_BOT_PROVIDE,
  USER_PROVIDE,
  WOBJECT_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import * as moment from 'moment';

import { CampaignHelperInterface } from '../interface';
import {
  CampaignPaymentType,
  CreateCampaignPaymentsType,
  CreateReviewType,
  GetBeneficiariesPaymentsType,
  GetCampaignPaymentsType,
  GetCommissionPaymentsType,
  GetReviewPaymentType,
  ParseReviewType,
  ReviewCampaignType,
  ReviewCommissionsType,
  UpdateReviewStatusesType,
  UpdateUserStatusType,
  ValidateReviewType,
} from './types';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import { AppRepositoryInterface } from '../../../persistance/app/interface';
import { UserDocumentType } from '../../../persistance/user/types';
import { CreateReviewInterface, FraudDetectionInterface } from './interface';
import { ObjectId } from 'mongoose';
import { WobjectRepositoryInterface } from '../../../persistance/wobject/interface';
import { CampaignPaymentRepositoryInterface } from '../../../persistance/campaign-payment/interface';
import { SponsorsBotInterface } from '../../sponsors-bot/interface';
import { getBodyLinksArray } from '../../../common/helpers';

@Injectable()
export class CreateReview implements CreateReviewInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(APP_PROVIDE.REPOSITORY)
    private readonly appRepository: AppRepositoryInterface,
    @Inject(REVIEW_PROVIDE.FRAUD)
    private readonly fraudDetection: FraudDetectionInterface,
    @Inject(WOBJECT_PROVIDE.REPOSITORY)
    private readonly wobjectRepository: WobjectRepositoryInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPaymentRepository: CampaignPaymentRepositoryInterface,
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
  ) {}

  async parseReview({
    metadata,
    beneficiaries,
    comment,
    app,
  }: ParseReviewType): Promise<void> {
    let botName, postAuthor;

    if (metadata?.comment?.userId) {
      postAuthor = metadata.comment.userId;
      botName = comment.author;
    } else postAuthor = comment.author;

    const metadataWobj = _.map(
      _.get(metadata, 'wobj.wobjects'),
      'author_permlink',
    );

    const bodyWobj = getBodyLinksArray({
      body: comment.body,
      regularExpression: REGEX_WOBJECT_REF,
    });

    const objects = _.uniq([...metadataWobj, ...bodyWobj]);

    if (_.isEmpty(objects)) return;

    const campaignsForReview = await this.findReviewCampaigns(
      postAuthor,
      objects,
    );
    if (_.isEmpty(campaignsForReview)) return;
    const validCampaigns = await this.validateReview({
      campaigns: campaignsForReview,
      metadata,
      postAuthor,
    });
    if (_.isEmpty(validCampaigns)) return;
    for (const validCampaign of validCampaigns) {
      await this.createReview({
        campaign: validCampaign,
        beneficiaries,
        objects,
        app,
        title: comment.title,
        reviewPermlink: comment.permlink,
        images: _.get(metadata, 'image', []),
        host: _.get(metadata, 'host', ''),
        botName,
      });
    }
  }

  async createReview({
    campaign,
    botName,
    beneficiaries,
    objects,
    title,
    app,
    host,
    images,
    reviewPermlink,
  }: CreateReviewType): Promise<void> {
    const objectPermlink = _.find(
      objects,
      (object) => campaign.userReservationObject === object,
    );
    if (_.isEmpty(objectPermlink)) return;
    await this.updateReviewStatuses({ campaign, images, reviewPermlink });
    await this.sponsorsBot.createUpvoteRecords({
      campaign,
      botName,
      permlink: reviewPermlink,
    });

    const payments = await this.getCampaignPayments({
      beneficiaries,
      campaign,
      host,
      isGuest: !!botName,
    });

    await this.createCampaignPayments({
      payments,
      campaign,
      app,
      botName,
      reviewPermlink,
      title,
    });
  }

  async createCampaignPayments({
    payments,
    campaign,
    title,
    app,
    reviewPermlink,
    botName,
  }: CreateCampaignPaymentsType): Promise<void> {
    const beneficiaries = _.chain(payments)
      .filter({ type: CAMPAIGN_PAYMENT.BENEFICIARY_FEE })
      .map((bnf) => ({ account: bnf.account, weight: bnf.weight }))
      .value();

    for (const payment of payments) {
      const result = await this.campaignPaymentRepository.create({
        amount: payment.amount,
        type: payment.type,
        payoutToken: campaign.payoutToken,
        guideName: campaign.guideName,
        userName: payment.account,
        beneficiaries,
        campaignId: campaign.campaignId,
        title,
        app,
        reviewPermlink,
        mainObject: campaign.requiredObject,
        reviewObject: campaign.userReservationObject,
        reservationPermlink: campaign.userReservationPermlink,
        isDemoAccount: !!botName,
        ...(payment.commission && { commission: payment.commission }),
      });
      if (result) {
        await this.campaignHelper.setExpireCampaignPayment(
          result._id,
          campaign.campaignId,
        );
      }
    }
    await this.campaignHelper.setExpireSuspendWarning({
      userReservationPermlink: campaign.userReservationPermlink,
      campaignId: campaign.campaignId,
      expire: REDIS_EXPIRE.CAMPAIGN_SUSPEND_WARNING_5,
      daysToSuspend: REDIS_DAYS_TO_SUSPEND.FIVE,
    });
  }

  private async updateReviewStatuses({
    campaign,
    images,
    reviewPermlink,
  }: UpdateReviewStatusesType): Promise<void> {
    const { fraud, fraudCodes } = await this.fraudDetection.detectFraud({
      campaign,
      images,
    });

    await this.updateUserStatus({
      campaignId: campaign.campaignId,
      userId: campaign.userId,
      fraud,
      fraudCodes,
      reviewPermlink,
    });

    await this.updateCampaignStatus(campaign.campaignId);
    await this.campaignHelper.checkOnHoldStatus(campaign.activationPermlink);
  }

  private async updateCampaignStatus(campaignId: ObjectId): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        _id: campaignId,
      },
    });
    if (!campaign) return;
    const thisMonthCompletedUsers = _.filter(
      campaign.users,
      (user) =>
        user.updatedAt > moment.utc().startOf('month') &&
        user.status === RESERVATION_STATUS.COMPLETED,
    );
    if (
      campaign.budget <= campaign.reward * thisMonthCompletedUsers.length ||
      campaign.budget - campaign.reward * thisMonthCompletedUsers.length <
        campaign.reward
    ) {
      await this.campaignRepository.updateOne({
        filter: { _id: campaignId },
        update: { status: CAMPAIGN_STATUS.REACHED_LIMIT },
      });
      await this.wobjectRepository.updateCampaignsCount(
        campaignId.toString(),
        CAMPAIGN_STATUS.REACHED_LIMIT,
        [campaign.requiredObject, ...campaign.objects],
      );
    }
  }

  private async updateUserStatus({
    campaignId,
    userId,
    fraud,
    fraudCodes,
    reviewPermlink,
  }: UpdateUserStatusType): Promise<void> {
    await this.campaignRepository.updateOne({
      filter: { _id: campaignId, users: { $elemMatch: { _id: userId } } },
      update: {
        $set: {
          'users.$.status': RESERVATION_STATUS.COMPLETED,
          'users.$.completedAt': moment.utc().format(),
          'users.$.reviewPermlink': reviewPermlink,
          'users.$.fraudSuspicion': fraud,
          'users.$.fraudCodes': fraudCodes,
        },
      },
    });
  }

  async getCampaignPayments({
    campaign,
    isGuest,
    beneficiaries,
    host,
  }: GetCampaignPaymentsType): Promise<CampaignPaymentType[]> {
    const tokenPrecision = PAYOUT_TOKEN_PRECISION[campaign.payoutToken];

    const rewardInToken = new BigNumber(campaign.rewardInUSD)
      .dividedBy(campaign.payoutTokenRateUSD)
      .decimalPlaces(tokenPrecision);

    const user = await this.userRepository.findOne({
      filter: { name: campaign.userName },
    });
    if (isGuest) {
      if (!_.get(user, 'user_metadata.settings.hiveBeneficiaryAccount')) {
        beneficiaries = _.filter(
          beneficiaries,
          (el) => el.account !== GUEST_BNF_ACC,
        );
      }
    }

    const beneficiariesPayments = this.getBeneficiariesPayments({
      beneficiaries,
      rewardInToken,
      tokenPrecision,
    });

    const reviewPayment = this.getReviewPayment({
      userName: campaign.userName,
      beneficiariesPayments,
      rewardInToken,
    });

    const commissionPayments = await this.getCommissionPayments({
      rewardInToken,
      commission: campaign.commissionAgreement,
      tokenPrecision,
      referralAgent: this.getReferralAgent(user),
      referralHost: campaign.campaignServer,
      appHost: host,
    });

    return [...commissionPayments, ...beneficiariesPayments, reviewPayment];
  }

  private getBeneficiariesPayments({
    beneficiaries,
    rewardInToken,
    tokenPrecision,
  }: GetBeneficiariesPaymentsType): CampaignPaymentType[] {
    return _.map(beneficiaries, (bnf) => ({
      account: bnf.account,
      amount: new BigNumber(bnf.weight)
        .dividedBy(10000)
        .times(rewardInToken)
        .decimalPlaces(tokenPrecision),
      weight: bnf.weight,
      type: CAMPAIGN_PAYMENT.BENEFICIARY_FEE,
    }));
  }

  private getReviewPayment({
    userName,
    rewardInToken,
    beneficiariesPayments,
  }: GetReviewPaymentType): CampaignPaymentType {
    return {
      account: userName,
      amount: new BigNumber(rewardInToken).minus(
        _.reduce(
          beneficiariesPayments,
          (accum, element) => new BigNumber(accum).plus(element.amount),
          new BigNumber(0),
        ),
      ),
      type: CAMPAIGN_PAYMENT.REVIEW,
    };
  }

  private getReferralAgent(user: UserDocumentType): string {
    const referralAcc = _.find(
      _.get(user, 'referral'),
      (referral) => referral.type === REFERRAL_TYPES.REWARDS,
    );
    return referralAcc && referralAcc.endedAt > new Date()
      ? referralAcc.agent
      : '';
  }

  private async getCommissionPayments({
    rewardInToken,
    commission,
    tokenPrecision,
    referralAgent,
    appHost,
    referralHost,
  }: GetCommissionPaymentsType): Promise<CampaignPaymentType[]> {
    const commissionPayments = [];
    const commissions = await this.getCommissions(appHost, referralHost);

    const campaignCommission = new BigNumber(rewardInToken)
      .times(commission)
      .times(commissions.campaignsCommission)
      .decimalPlaces(tokenPrecision);

    if (campaignCommission.gt(0)) {
      commissionPayments.push({
        account: commissions.campaignsAccount,
        amount: campaignCommission,
        type: CAMPAIGN_PAYMENT.CAMPAIGNS_SERVER_FEE,
        commission: new BigNumber(campaignCommission)
          .dividedBy(rewardInToken)
          .times(1000)
          .decimalPlaces(tokenPrecision),
      });
    }

    const indexCommission = new BigNumber(rewardInToken)
      .times(commission)
      .minus(campaignCommission)
      .times(commissions.indexCommission)
      .decimalPlaces(tokenPrecision);

    if (indexCommission.gt(0)) {
      commissionPayments.push({
        account: commissions.indexAccount,
        amount: indexCommission,
        type: CAMPAIGN_PAYMENT.INDEX_FEE,
        commission: new BigNumber(indexCommission)
          .dividedBy(rewardInToken)
          .times(10000)
          .decimalPlaces(tokenPrecision),
      });
    }

    if (
      campaignCommission
        .plus(indexCommission)
        .eq(
          new BigNumber(rewardInToken)
            .times(commission)
            .decimalPlaces(tokenPrecision),
        )
    ) {
      return commissionPayments;
    }

    const referralCommission = new BigNumber(rewardInToken)
      .times(commission)
      .minus(campaignCommission)
      .minus(indexCommission)
      .decimalPlaces(tokenPrecision);

    commissionPayments.push({
      account: referralAgent || commissions.referralAccount,
      amount: referralCommission,
      type: CAMPAIGN_PAYMENT.REFERRAL_SERVER_FEE,
      commission: new BigNumber(referralCommission)
        .dividedBy(rewardInToken)
        .times(10000)
        .decimalPlaces(tokenPrecision),
    });

    return commissionPayments;
  }

  private async getCommissions(
    appHost: string,
    referralHost: string,
  ): Promise<ReviewCommissionsType> {
    const host = await this.appRepository.findOne({
      filter: { host: appHost },
      projection: { app_commissions: 1 },
    });
    const refHost = await this.appRepository.findOne({
      filter: { host: referralHost },
      projection: { app_commissions: 1, owner: 1 },
    });
    return {
      indexCommission: _.get(host, 'app_commissions.index_percent', 0.2),
      indexAccount: _.get(
        host,
        'app_commissions.index_commission_acc',
        'waivio.index',
      ),
      campaignsCommission: _.get(
        host,
        'app_commissions.campaigns_percent',
        0.3,
      ),
      campaignsAccount: _.get(
        host,
        'app_commissions.campaigns_server_acc',
        'waivio.campaigns',
      ),
      referralAccount: _.get(
        refHost,
        'app_commissions.referral_commission_acc',
        _.get(
          refHost,
          'owner',
          _.get(
            host,
            'app_commissions.referral_commission_acc',
            'waivio.referrals',
          ),
        ),
      ),
    };
  }

  private async validateReview({
    campaigns,
    metadata,
    postAuthor,
  }: ValidateReviewType): Promise<ReviewCampaignType[]> {
    const validCampaigns = [];
    const user = await this.userRepository.findOne({
      filter: { name: postAuthor },
    });
    if (!user) return [];
    user.wobjects_weight = user.wobjects_weight < 0 ? 0 : user.wobjects_weight;
    for (const campaign of campaigns) {
      const isValid = {
        photos:
          _.get(metadata, 'image', []).length >=
          _.get(campaign, 'requirements.minPhotos', 0),
        followers:
          _.get(user, 'followers_count', 0) >=
          _.get(campaign, 'userRequirements.minFollowers', 0),
        posts:
          _.get(user, 'count_posts', 0) >=
          _.get(campaign, 'userRequirements.minPosts', 0),
        expertise:
          _.get(user, 'wobjects_weight', 0) >=
          _.get(campaign, 'userRequirements.minExpertise', 0),
      };
      if (_.every(Object.values(isValid))) validCampaigns.push(campaign);
    }
    return validCampaigns;
  }

  private async findReviewCampaigns(
    postAuthor: string,
    objects: string[],
  ): Promise<ReviewCampaignType[]> {
    return this.campaignRepository.aggregate({
      pipeline: [
        { $unwind: '$users' },
        {
          $match: {
            'users.objectPermlink': { $in: objects },
            'users.name': postAuthor,
            'users.status': RESERVATION_STATUS.ASSIGNED,
          },
        },
        {
          $project: {
            userId: '$users._id',
            userName: '$users.name',
            rewardRaisedBy: '$users.rewardRaisedBy',
            referralServer: '$users.referralServer',
            userStatus: '$users.status',
            userReservationObject: '$users.objectPermlink',
            userReservationPermlink: '$users.reservationPermlink',
            reservedAt: '$users.createdAt',
            payoutTokenRateUSD: '$users.payoutTokenRateUSD',
            campaignId: '$_id',
            campaignServer: '$app',
            requiredObject: 1,
            userRequirements: 1,
            activationPermlink: 1,
            rewardInUSD: 1,
            requirements: 1,
            payoutToken: 1,
            currency: 1,
            reward: 1,
            guideName: 1,
            commissionAgreement: 1,
            matchBots: 1,
            type: 1,
            _id: 0,
          },
        },
      ],
    });
  }
}
