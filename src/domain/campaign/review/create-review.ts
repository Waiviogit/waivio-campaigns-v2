import { Inject, Injectable } from '@nestjs/common';
import {
  APP_PROVIDE,
  CAMPAIGN_PAYMENT,
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  GUEST_BNF_ACC,
  PAYOUT_TOKEN_PRECISION,
  POST_PROVIDE,
  REDIS_DAYS_TO_SUSPEND,
  REDIS_EXPIRE,
  CAMPAIGN_POSTS_PROVIDE,
  REFERRAL_TYPES,
  RESERVATION_STATUS,
  REVIEW_PROVIDE,
  SPONSORS_BOT_PROVIDE,
  USER_PROVIDE,
  WOBJECT_PROVIDE,
  PAYMENT_SELF_POSTFIX,
  REWARDS_PROVIDE,
  REDIS_PROVIDE,
  REDIS_KEY,
  HOSTS_TO_PARSE_LINKS,
  WOBJECT_REF,
  CAMPAIGN_TYPE,
  TOKEN_WAIV,
  HIVE_PROVIDE,
  CAMPAIGN_CUSTOM_JSON_ID,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import * as moment from 'moment';

import { CampaignHelperInterface } from '../interface';
import {
  CampaignPaymentType,
  CreateCampaignPaymentsType,
  CreateMentionType,
  CreateReviewType,
  GetBeneficiariesPaymentsType,
  GetCampaignPaymentsType,
  GetCommissionPaymentsType,
  GetReviewPaymentType,
  ParseReviewType,
  QualifyConditionType,
  ReviewCampaignType,
  ReviewCommissionsType,
  reviewMessageSuccessType,
  UpdateMentionStatusesType,
  UpdateReviewStatusesType,
  UpdateUserStatusType,
  ValidateReviewType,
} from './types';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import { AppRepositoryInterface } from '../../../persistance/app/interface';
import { UserDocumentType } from '../../../persistance/user/types';
import {
  CreateReviewInterface,
  FraudDetectionInterface,
  getSelfOrGivenTypeInterface,
  RaiseRewardInterface,
  ReduceRewardInterface,
  RestoreReviewInterface,
} from './interface';
import { ObjectId } from 'mongoose';
import { WobjectRepositoryInterface } from '../../../persistance/wobject/interface';
import { CampaignPaymentRepositoryInterface } from '../../../persistance/campaign-payment/interface';
import { SponsorsBotInterface } from '../../sponsors-bot/interface';
import {
  extractLinks,
  findPossibleLinks,
  getBodyLinksArray,
  getMentionsFromPost,
  parseJSON,
} from '../../../common/helpers';
import { PostRepositoryInterface } from '../../../persistance/post/interface';
import { CampaignPostsRepositoryInterface } from '../../../persistance/campaign-posts/interface';
import { RewardsAllInterface } from '../rewards/interface';
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import { RedisClientInterface } from '../../../services/redis/clients/interface';
import { MetadataType } from '../../hive-parser/types';
import { HiveClientInterface } from '../../../services/hive-api/interface';
import { configService } from '../../../common/config';
import * as crypto from 'node:crypto';
import { RestoreCustomType } from '../../../common/types';
import { parserValidator } from '../../hive-parser/validators';
import { WobjectHelperInterface } from '../../wobject/interface';

@Injectable()
export class CreateReview implements CreateReviewInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(POST_PROVIDE.REPOSITORY)
    private readonly postRepository: PostRepositoryInterface,
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
    @Inject(CAMPAIGN_POSTS_PROVIDE.REPOSITORY)
    private readonly campaignPostsRepository: CampaignPostsRepositoryInterface,
    @Inject(REWARDS_PROVIDE.ALL)
    private readonly rewardsAll: RewardsAllInterface,
    @Inject(REDIS_PROVIDE.BLOCK_CLIENT)
    private readonly blockRedisClient: RedisClientInterface,
    @Inject(HIVE_PROVIDE.CLIENT)
    private readonly hiveClient: HiveClientInterface,
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
  ) {}

  //redis key HOSTS_TO_PARSE_OBJECTS is set on hive parser
  async getHostsToParseObjects(): Promise<string[]> {
    const cache = await this.blockRedisClient.get(
      REDIS_KEY.HOSTS_TO_PARSE_OBJECTS,
    );
    if (cache) {
      return parseJSON(cache);
    }
    return HOSTS_TO_PARSE_LINKS;
  }

  async getRegExToParseObjects(): Promise<RegExp> {
    const hosts = await this.getHostsToParseObjects();
    return RegExp(`${hosts.map((el) => `${el}${WOBJECT_REF}`).join('|')}`);
  }

  //in Future Can Validate MultipleTokens
  getQualifiedPayoutTokenCondition(
    metadata: MetadataType,
  ): QualifyConditionType {
    const qualified = TOKEN_WAIV.TAGS.some((el) =>
      (metadata?.tags ?? []).includes(el),
    );
    if (qualified) return {};

    return { qualifiedPayoutToken: false };
  }

  async raiseReward({
    activationPermlink,
    guideName,
    user,
    parentPermlink,
    permlink,
    riseAmount,
  }: RaiseRewardInterface): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: { activationPermlink },
    });
    if (!campaign || campaign.guideName !== guideName) return;
    await this.campaignRepository.updateOne({
      filter: {
        activationPermlink,
        users: {
          $elemMatch: {
            name: user,
            reservationPermlink: parentPermlink,
          },
        },
      },
      update: {
        'users.$.rewardRaisedBy': riseAmount,
        'users.$.riseRewardPermlink': permlink,
      },
    });
    const campaignUser = campaign.users.find(
      (u) => u.reservationPermlink === parentPermlink,
    );
    if (!campaignUser || campaignUser.status !== RESERVATION_STATUS.COMPLETED) {
      return;
    }
    await this.campaignPaymentRepository.updateOne({
      filter: {
        type: CAMPAIGN_PAYMENT.REVIEW,
        reservationPermlink: parentPermlink,
      },
      update: {
        $inc: { amount: new BigNumber(riseAmount) },
      },
    });
  }

  async reduceReward({
    activationPermlink,
    user,
    parentPermlink,
    permlink,
    reduceAmount,
  }: ReduceRewardInterface): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: { activationPermlink },
    });
    if (!campaign) return;
    const campaignUser = _.find(campaign.users, {
      name: user,
      reservationPermlink: parentPermlink,
    });
    if (
      !campaignUser ||
      !_.includes(['assigned', 'completed'], campaignUser.status)
    ) {
      return;
    }
    await this.campaignRepository.updateOne({
      filter: {
        _id: campaign._id,
        users: {
          $elemMatch: { _id: campaignUser._id },
        },
      },
      update: {
        'users.$.rewardReducedBy': reduceAmount,
        'users.$.reduceRewardPermlink': permlink,
      },
    });
    if (campaignUser.status !== RESERVATION_STATUS.COMPLETED) return;
    const payment = await this.campaignPaymentRepository.findOne({
      filter: {
        type: CAMPAIGN_PAYMENT.REVIEW,
        reservationPermlink: parentPermlink,
      },
    });
    const amountToUpdate = new BigNumber(payment.amount).gt(reduceAmount)
      ? new BigNumber(reduceAmount).negated()
      : new BigNumber(payment.amount).negated();

    await this.campaignPaymentRepository.updateOne({
      filter: {
        type: CAMPAIGN_PAYMENT.REVIEW,
        reservationPermlink: parentPermlink,
      },
      update: {
        $inc: { amount: amountToUpdate },
      },
    });
  }

  async getObjectTypeLinkFromUrl(body: string): Promise<string[]> {
    const urls = extractLinks(body);
    const modifiedUrls = [];

    for (const url of urls) {
      const possibleLinks = findPossibleLinks(url);
      modifiedUrls.push(...possibleLinks);
    }

    const permlinks = _.uniq(modifiedUrls);

    const result = await this.wobjectRepository.find({
      filter: {
        object_type: 'link',
        fields: {
          $elemMatch: {
            name: 'url',
            body: { $in: permlinks },
          },
        },
      },
      projection: {
        author_permlink: 1,
      },
    });

    return result.map((el) => el.author_permlink);
  }

  async parseReview({
    metadata,
    beneficiaries,
    comment,
    app,
  }: ParseReviewType): Promise<void> {
    if (comment.parent_author) return;

    let botName, postAuthor;

    if (metadata?.comment?.userId) {
      postAuthor = metadata.comment.userId;
      botName = comment.author;
    } else postAuthor = comment.author;

    const metadataWobj = _.map(
      _.get(metadata, 'wobj.wobjects'),
      'author_permlink',
    );

    const regexObjects = await this.getRegExToParseObjects();

    const bodyWobj = getBodyLinksArray({
      body: comment.body,
      regularExpression: regexObjects,
    });
    const objects = _.uniq([...metadataWobj, ...bodyWobj]);
    const mentions = getMentionsFromPost(comment.body);
    const links = await this.getObjectTypeLinkFromUrl(comment.body);

    const qualifiedTokenCondition =
      this.getQualifiedPayoutTokenCondition(metadata);

    const campaignsForReview = await this.findReviewCampaigns(
      postAuthor,
      objects,
      {},
    );

    const campaignsForMentions = await this.findMentionCampaigns(
      postAuthor,
      [...objects, ...mentions, ...links],
      qualifiedTokenCondition,
    );

    const postImages = _.get(metadata, 'image', []);

    if (campaignsForMentions.length) {
      for (const campaignsForMention of campaignsForMentions) {
        if (postImages < campaignsForMention.requirements.minPhotos) continue;

        await this.createMention({
          campaign: campaignsForMention,
          beneficiaries,
          app,
          title: comment.title,
          reviewPermlink: comment.permlink,
          host: _.get(metadata, 'host', ''),
          botName,
          postAuthor,
          postMentions: [...objects, ...mentions, ...links],
          images: postImages,
        });
      }
    }

    if (!_.isEmpty(campaignsForReview)) {
      const validCampaignsReview = await this.validateReview({
        campaigns: campaignsForReview,
        metadata,
        postAuthor,
      });

      if (!_.isEmpty(validCampaignsReview)) {
        for (const validCampaign of validCampaignsReview) {
          await this.createReview({
            campaign: validCampaign,
            beneficiaries,
            objects,
            app,
            title: comment.title,
            reviewPermlink: comment.permlink,
            images: postImages,
            host: _.get(metadata, 'host', ''),
            botName,
            postAuthor,
          });
        }
      }
    }
  }

  async parseRestoreFromCustomJson({
    id,
    parsedJson,
    required_auths,
    required_posting_auths,
    transaction_id,
  }: RestoreCustomType): Promise<void> {
    if (id !== CAMPAIGN_CUSTOM_JSON_ID.MAIN) return;
    if (parsedJson?.action !== CAMPAIGN_CUSTOM_JSON_ID.RESTORE_BY_GUIDE) return;

    const authorizedUser = _.isEmpty(required_auths)
      ? required_posting_auths[0]
      : required_auths[0];

    if (authorizedUser !== parsedJson?.payload?.guideName) return;

    const payload = (await parserValidator.validateCampaignRestoreCustom(
      parsedJson?.payload?.guideName,
      parsedJson?.payload?.reservationPermlink,
      parsedJson?.payload?.user,
    )) as RestoreReviewInterface;
    if (!payload) return;

    await this.restoreReview(payload);
    await this.campaignRedisClient.publish(
      REDIS_KEY.PUBLISH_EXPIRE_TRX_ID,
      transaction_id,
    );
  }

  async restoreReview({
    user,
    parentPermlink,
    guideName,
  }: RestoreReviewInterface): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        guideName,
        users: {
          $elemMatch: { rootName: user, reservationPermlink: parentPermlink },
        },
      },
    });
    if (!campaign) return;
    const rejectedUser = campaign.users.find(
      (u) =>
        u.status === RESERVATION_STATUS.REJECTED &&
        u.reservationPermlink === parentPermlink,
    );
    if (!rejectedUser) return;
    const havePost = !!rejectedUser.reviewPermlink;
    if (havePost) {
      const post = await this.postRepository.findOne({
        filter: {
          author: rejectedUser.name,
          permlink: rejectedUser.reviewPermlink,
        },
      });
      if (!post) return;
      const reviewCampaign: ReviewCampaignType = {
        userId: rejectedUser._id,
        userName: rejectedUser.name,
        rewardRaisedBy: rejectedUser.rewardRaisedBy,
        rewardReducedBy: rejectedUser.rewardReducedBy,
        referralServer: rejectedUser.referralServer,
        userStatus: rejectedUser.status,
        userReservationObject: rejectedUser.objectPermlink,
        userReservationPermlink: rejectedUser.reservationPermlink,
        reservedAt: rejectedUser.createdAt.toString(),
        payoutTokenRateUSD: rejectedUser.payoutTokenRateUSD,
        campaignId: campaign._id,
        campaignServer: campaign.app,
        requiredObject: campaign.requiredObject,
        userRequirements: campaign.userRequirements,
        activationPermlink: campaign.activationPermlink,
        rewardInUSD: campaign.rewardInUSD,
        requirements: campaign.requirements,
        payoutToken: campaign.payoutToken,
        currency: campaign.currency,
        reward: campaign.reward,
        guideName: campaign.guideName,
        commissionAgreement: campaign.commissionAgreement,
        matchBots: campaign.matchBots,
        type: campaign.type,
      };

      if (campaign.type === CAMPAIGN_TYPE.REVIEWS) {
        await this.createReview({
          campaign: reviewCampaign,
          beneficiaries: post.beneficiaries,
          objects: [rejectedUser.objectPermlink],
          title: post.title,
          app: campaign.campaignServer,
          host: _.get(parseJSON(post.json_metadata), 'host', null),
          reviewPermlink: post.permlink,
          images: _.get(parseJSON(post.json_metadata), 'image', []),
          postAuthor: rejectedUser.name,
        });
      }

      if (campaign.type === CAMPAIGN_TYPE.MENTIONS) {
        await this.createMention({
          campaign,
          beneficiaries: post.beneficiaries,
          title: post.title,
          app: campaign.campaignServer,
          host: _.get(parseJSON(post.json_metadata), 'host', null),
          reviewPermlink: post.permlink,
          images: _.get(parseJSON(post.json_metadata), 'image', []),
          postAuthor: rejectedUser.name,
          postMentions: [rejectedUser.objectPermlink],
        });
      }
    }

    //remove rejection permlink
    await this.campaignRepository.updateOne({
      filter: {
        _id: campaign._id,
        users: {
          $elemMatch: {
            name: rejectedUser.name,
            reservationPermlink: rejectedUser.reservationPermlink,
          },
        },
      },
      update: {
        $set: {
          'users.$.status': havePost
            ? RESERVATION_STATUS.COMPLETED
            : RESERVATION_STATUS.ASSIGNED,
          'users.$.rejectionPermlink': '',
        },
      },
    });
  }

  getAdditionalReward(campaign: ReviewCampaignType): BigNumber {
    if (campaign.rewardRaisedBy) {
      return new BigNumber(campaign.rewardRaisedBy);
    }
    if (campaign.rewardReducedBy) {
      return new BigNumber(campaign.rewardReducedBy).negated();
    }

    return new BigNumber(0);
  }

  async sendMessageSuccessReview({
    campaign,
    userReservationObject,
    reviewPermlink,
    postAuthor,
    botName,
  }: reviewMessageSuccessType): Promise<void> {
    const sponsor = await this.userRepository.findOne({
      filter: { name: campaign.guideName },
    });

    const linksToObjects = [];

    const objects = _.uniq([campaign.requiredObject, userReservationObject]);
    for (const object of objects) {
      if (object.startsWith('@')) {
        const acc = await this.userRepository.findOne({
          filter: { name: object.slice(1) },
        });
        if (!acc) continue;

        linksToObjects.push(
          `[${acc.alias || acc.name}](https://www.waivio.com/@${acc.name})`,
        );
        continue;
      }

      const objName = await this.wobjectHelper.getWobjectName(object);
      linksToObjects.push(
        `[${objName}](https://www.waivio.com/object/${object})`,
      );
    }

    const message = `Thanks for your post! Since you mentioned ${linksToObjects.join(
      ', ',
    )} [and included two or more photos], you’re eligible for potential rewards of $${
      campaign.rewardInUSD
    } USD from [${sponsor.alias || sponsor.name}](https://www.waivio.com/@${
      campaign.guideName
    })! 
Your post will be reviewed, and if it meets quality standards, the reward will be yours. 
You can track all of your outstanding payments and discover many more rewards [here] (https://www.waivio.com/rewards/global). Keep sharing great content!`;

    await this.hiveClient.createComment({
      parent_author: botName || postAuthor,
      parent_permlink: reviewPermlink,
      title: '',
      json_metadata: '',
      body: message,
      author: configService.getMentionsAccount(),
      permlink: `re-${crypto.randomUUID()}`,
      key: configService.getMentionsPostingKey(),
    });
  }

  async createMention({
    campaign,
    botName,
    reviewPermlink,
    postAuthor,
    beneficiaries,
    host,
    app,
    title,
    postMentions,
    images,
  }: CreateMentionType): Promise<void> {
    //generate reservation permlink because it used in payments aggregation as uniq field
    const reservationPermlink = crypto.randomUUID();

    const tokenPrecision = PAYOUT_TOKEN_PRECISION[campaign.payoutToken];

    const payoutTokenRateUSD = await this.campaignHelper.getPayoutTokenRateUSD(
      campaign.payoutToken,
    );

    const objectsQualified = _.intersection(campaign.objects, postMentions);

    const userReservationObject = objectsQualified[0];

    const rewardInToken = new BigNumber(campaign.rewardInUSD)
      .dividedBy(payoutTokenRateUSD)
      .decimalPlaces(tokenPrecision);

    await this.updateMentionStatuses({
      campaign,
      app,
      botName,
      reviewPermlink,
      postAuthor,
      images,
      payoutTokenRateUSD,
      reservationPermlink,
    });

    const campaignReviewType = {
      ...campaign,
      userName: postAuthor,
      payoutTokenRateUSD,
      campaignId: campaign._id,
      userReservationObject,
    } as never as ReviewCampaignType;

    await this.sponsorsBot.createUpvoteRecords({
      campaign: campaignReviewType,
      botName,
      permlink: reviewPermlink,
      rewardInToken,
      reservationPermlink,
    });

    const payments = await this.getCampaignPayments({
      beneficiaries,
      campaign: campaignReviewType,
      host,
      isGuest: !!botName,
      rewardInToken,
    });

    await this.createCampaignPayments({
      payments,
      campaign: campaignReviewType,
      app,
      botName,
      reviewPermlink,
      title,
      reservationPermlink,
      campaignType: CAMPAIGN_TYPE.MENTIONS,
    });

    await this.campaignPostsRepository.create({
      author: postAuthor,
      permlink: reviewPermlink,
      rewardInToken: rewardInToken.toNumber(),
      symbol: campaign.payoutToken,
      guideName: campaign.guideName,
      payoutTokenRateUSD,
      reservationPermlink,
    });

    await this.sendMessageSuccessReview({
      campaign,
      botName,
      postAuthor,
      reviewPermlink,
      userReservationObject,
    });
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
    postAuthor,
  }: CreateReviewType): Promise<void> {
    const objectPermlink = _.find(
      objects,
      (object) => campaign.userReservationObject === object,
    );
    if (_.isEmpty(objectPermlink)) return;
    await this.updateReviewStatuses({ campaign, images, reviewPermlink });

    const tokenPrecision = PAYOUT_TOKEN_PRECISION[campaign.payoutToken];

    const additionalReward = this.getAdditionalReward(campaign);
    const rewardInToken = new BigNumber(campaign.rewardInUSD)
      .dividedBy(campaign.payoutTokenRateUSD)
      .plus(additionalReward)
      .decimalPlaces(tokenPrecision);

    await this.sponsorsBot.createUpvoteRecords({
      campaign,
      botName,
      permlink: reviewPermlink,
      rewardInToken,
    });

    const payments = await this.getCampaignPayments({
      beneficiaries,
      campaign,
      host,
      isGuest: !!botName,
      rewardInToken,
    });

    await this.createCampaignPayments({
      payments,
      campaign,
      app,
      botName,
      reviewPermlink,
      title,
      campaignType: CAMPAIGN_TYPE.REVIEWS,
    });

    await this.campaignPostsRepository.create({
      author: postAuthor,
      permlink: reviewPermlink,
      rewardInToken: rewardInToken.toNumber(),
      symbol: campaign.payoutToken,
      guideName: campaign.guideName,
      payoutTokenRateUSD: campaign.payoutTokenRateUSD,
      reservationPermlink: campaign.userReservationPermlink,
    });
  }

  async createCampaignPayments({
    payments,
    campaign,
    title,
    app,
    reviewPermlink,
    botName,
    reservationPermlink,
    campaignType,
  }: CreateCampaignPaymentsType): Promise<void> {
    const beneficiaries = _.chain(payments)
      .filter({ type: CAMPAIGN_PAYMENT.BENEFICIARY_FEE })
      .map((bnf) => ({ account: bnf.account, weight: bnf.weight }))
      .value();

    for (const payment of payments) {
      const result = await this.campaignPaymentRepository.create({
        campaignType,
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
        payoutTokenRateUSD: campaign.payoutTokenRateUSD,
        reviewObject: campaign.userReservationObject,
        reservationPermlink:
          campaign.userReservationPermlink || reservationPermlink,
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
      userReservationPermlink:
        campaign.userReservationPermlink || reservationPermlink,
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

  async updateMentionStatuses({
    campaign,
    reviewPermlink,
    images,
    payoutTokenRateUSD,
    postAuthor,
    botName,
    app,
    reservationPermlink,
  }: UpdateMentionStatusesType): Promise<void> {
    const { fraud, fraudCodes } = await this.fraudDetection.detectFraud({
      campaign: campaign as never as ReviewCampaignType,
      images,
    });

    await this.campaignRepository.updateOne({
      filter: { _id: campaign._id, status: CAMPAIGN_STATUS.ACTIVE },
      update: {
        $push: {
          users: {
            name: postAuthor,
            rootName: botName || postAuthor,
            status: RESERVATION_STATUS.COMPLETED,
            payoutTokenRateUSD,
            objectPermlink: campaign.requiredObject,
            referralServer: app,
            completedAt: moment.utc().format(),
            fraudSuspicion: fraud,
            fraudCodes,
            reviewPermlink,
            reservationPermlink,
          },
        },
      },
    });

    await this.updateCampaignStatus(campaign._id);
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
    rewardInToken,
  }: GetCampaignPaymentsType): Promise<CampaignPaymentType[]> {
    const tokenPrecision = PAYOUT_TOKEN_PRECISION[campaign.payoutToken];
    const user = await this.userRepository.findOne({
      filter: { name: campaign.userName },
    });

    if (isGuest) {
      const hiveBeneficiaryAccount = _.get(
        user,
        'user_metadata.settings.hiveBeneficiaryAccount',
      );
      if (!hiveBeneficiaryAccount) {
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
      guideName: campaign.guideName,
    });

    const reviewPayment = this.getReviewPayment({
      userName: campaign.userName,
      beneficiariesPayments,
      rewardInToken,
      guideName: campaign.guideName,
    });

    const commissionPayments = await this.getCommissionPayments({
      rewardInToken,
      commission: campaign.commissionAgreement,
      tokenPrecision,
      referralAgent: this.getReferralAgent(user),
      referralHost: campaign.campaignServer,
      appHost: host,
      guideName: campaign.guideName,
    });

    return [...commissionPayments, ...beneficiariesPayments, reviewPayment];
  }

  private getSelfOrGivenType({
    type,
    guideName,
    account,
  }: getSelfOrGivenTypeInterface): string {
    if (guideName === account) return `${type}${PAYMENT_SELF_POSTFIX}`;
    return type;
  }

  private getBeneficiariesPayments({
    beneficiaries,
    rewardInToken,
    tokenPrecision,
    guideName,
  }: GetBeneficiariesPaymentsType): CampaignPaymentType[] {
    return _.map(beneficiaries, (bnf) => ({
      account: bnf.account,
      amount: new BigNumber(bnf.weight)
        .dividedBy(10000)
        .times(rewardInToken)
        .decimalPlaces(tokenPrecision),
      weight: bnf.weight,
      type: this.getSelfOrGivenType({
        type: CAMPAIGN_PAYMENT.BENEFICIARY_FEE,
        guideName,
        account: bnf.account,
      }),
    }));
  }

  private getReviewPayment({
    userName,
    rewardInToken,
    beneficiariesPayments,
    guideName,
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
      type: this.getSelfOrGivenType({
        type: CAMPAIGN_PAYMENT.REVIEW,
        guideName,
        account: userName,
      }),
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
    guideName,
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
        type: this.getSelfOrGivenType({
          type: CAMPAIGN_PAYMENT.CAMPAIGNS_SERVER_FEE,
          guideName,
          account: commissions.campaignsAccount,
        }),
        commission: new BigNumber(campaignCommission)
          .dividedBy(rewardInToken)
          .times(10000)
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
        type: this.getSelfOrGivenType({
          type: CAMPAIGN_PAYMENT.INDEX_FEE,
          guideName,
          account: commissions.indexAccount,
        }),
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

    const referralServerAccount = referralAgent || commissions.referralAccount;

    commissionPayments.push({
      account: referralServerAccount,
      amount: referralCommission,
      type: this.getSelfOrGivenType({
        type: CAMPAIGN_PAYMENT.REFERRAL_SERVER_FEE,
        guideName,
        account: referralServerAccount,
      }),
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
    qualifyCondition: QualifyConditionType,
  ): Promise<ReviewCampaignType[]> {
    return this.campaignRepository.aggregate({
      pipeline: [
        { $unwind: '$users' },
        {
          $match: {
            type: CAMPAIGN_TYPE.REVIEWS,
            'users.objectPermlink': { $in: objects },
            'users.name': postAuthor,
            'users.status': RESERVATION_STATUS.ASSIGNED,
            ...qualifyCondition,
          },
        },
        {
          $project: {
            userId: '$users._id',
            userName: '$users.name',
            rewardRaisedBy: '$users.rewardRaisedBy',
            rewardReducedBy: '$users.rewardReducedBy',
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

  private async findMentionCampaigns(
    userName: string,
    objects: string[],
    qualifyCondition: QualifyConditionType,
  ): Promise<CampaignDocumentType[]> {
    const user = await this.userRepository.findOne({
      filter: { name: userName },
      projection: { count_posts: 1, followers_count: 1, wobjects_weight: 1 },
    });

    const eligible = await this.rewardsAll.getEligiblePipe({ userName, user });

    const campaigns = (await this.campaignRepository.aggregate({
      pipeline: [
        {
          $match: {
            requiredObject: { $in: objects },
            objects: { $elemMatch: { $in: objects } },
            type: CAMPAIGN_TYPE.MENTIONS,
            status: CAMPAIGN_STATUS.ACTIVE,
            ...qualifyCondition,
          },
        },
        ...eligible,
      ],
    })) as CampaignDocumentType[];
    return campaigns;
  }
}
