import { Inject, Injectable } from '@nestjs/common';
import {
  CAMPAIGN_CUSTOM_JSON_ID,
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_POSTS_PROVIDE,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_TYPE,
  REDIS_KEY,
  REDIS_PROVIDE,
  RESERVATION_STATUS,
  REVIEW_PROVIDE,
  SPONSORS_BOT_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import * as _ from 'lodash';
import {
  CampaignHelperInterface,
  CampaignSuspendInterface,
} from '../interface';
import { GuideRejectReservationType, UpdateCampaignReviewType } from './types';
import { GuideRejectReservationInterface } from './interface';
import { SponsorsBotInterface } from '../../sponsors-bot/interface';
import { CampaignPaymentRepository } from '../../../persistance/campaign-payment/campaign-payment.repository';
import { CampaignPostsRepositoryInterface } from '../../../persistance/campaign-posts/interface';
import { RejectCustomType } from '../../../common/types';
import { parserValidator } from '../../hive-parser/validators';
import { RedisClientInterface } from '../../../services/redis/clients/interface';
import { MessageOnReviewInterface } from '../review/interface/message-on-review.interface';
import { CampaignPaymentRepositoryInterface } from '../../../persistance/campaign-payment/interface';

@Injectable()
export class GuideRejectReservation implements GuideRejectReservationInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPayment: CampaignPaymentRepository,
    @Inject(CAMPAIGN_PROVIDE.SUSPEND)
    private readonly campaignSuspend: CampaignSuspendInterface,
    @Inject(CAMPAIGN_POSTS_PROVIDE.REPOSITORY)
    private readonly campaignPostsRepository: CampaignPostsRepositoryInterface,
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
    @Inject(REVIEW_PROVIDE.MESSAGE_ON_REVIEW)
    private readonly messageOnReview: MessageOnReviewInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPaymentRepository: CampaignPaymentRepositoryInterface,
  ) {}

  private async updateCampaignReview({
    _id,
    user,
    rejectionPermlink,
  }: UpdateCampaignReviewType): Promise<void> {
    await this.campaignRepository.updateOne({
      filter: {
        _id,
        users: {
          $elemMatch: {
            name: user.name,
            status: user.status,
            reservationPermlink: user.reservationPermlink,
          },
        },
      },
      update: {
        $set: {
          'users.$.status': RESERVATION_STATUS.REJECTED,
          'users.$.rejectionPermlink': rejectionPermlink,
        },
      },
    });
  }

  async parseRejectFromCustomJson({
    id,
    parsedJson,
    required_auths,
    required_posting_auths,
    transaction_id,
  }: RejectCustomType): Promise<void> {
    if (id !== CAMPAIGN_CUSTOM_JSON_ID.MAIN) return;
    if (parsedJson?.action !== CAMPAIGN_CUSTOM_JSON_ID.REJECT_BY_GUIDE) return;

    const authorizedUser = _.isEmpty(required_auths)
      ? required_posting_auths[0]
      : required_auths[0];

    if (authorizedUser !== parsedJson?.payload?.guideName) return;

    const payload = (await parserValidator.validateCampaignRejectCustom(
      parsedJson?.payload?.guideName,
      parsedJson?.payload?.reservationPermlink,
      transaction_id,
    )) as GuideRejectReservationType;
    if (!payload) return;
    const campaign = await this.campaignRepository.findOne({
      filter: {
        guideName: payload.guideName,
        users: {
          $elemMatch: { reservationPermlink: payload.reservationPermlink },
        },
      },
      projection: {
        activationPermlink: 1,
        type: 1,
      },
    });
    if (!campaign) return;

    if (campaign.type === CAMPAIGN_TYPE.MENTIONS) {
      await this.messageOnReview.rejectMentionMessage({
        guideName: payload.guideName,
        reservationPermlink: payload.reservationPermlink,
      });
    }
    await this.reject(payload);
    //need to be here because of completion status
    if (campaign.type === CAMPAIGN_TYPE.GIVEAWAYS) {
      this.messageOnReview.giveawayMessage(campaign.activationPermlink);
    }
    if (campaign.type === CAMPAIGN_TYPE.GIVEAWAYS_OBJECT) {
      this.messageOnReview.rejectMessageObjectGiveaway(
        campaign.activationPermlink,
        payload.reservationPermlink,
      );
    }

    await this.campaignRedisClient.publish(
      REDIS_KEY.PUBLISH_EXPIRE_TRX_ID,
      transaction_id,
    );
  }

  async reject({
    reservationPermlink,
    guideName,
    rejectionPermlink,
  }: GuideRejectReservationType): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        guideName: guideName,
        users: {
          $elemMatch: { reservationPermlink },
        },
      },
    });
    if (!campaign) return;

    const user = _.find(
      campaign.users,
      (user) => user.reservationPermlink === reservationPermlink,
    );
    if (!user) return;
    switch (user.status) {
      case RESERVATION_STATUS.ASSIGNED:
        await this.updateCampaignReview({
          _id: campaign._id,
          user,
          rejectionPermlink,
        });
        await this.campaignHelper.checkOnHoldStatus(
          campaign.activationPermlink,
        );
        break;
      case RESERVATION_STATUS.COMPLETED:
        await this.updateCampaignReview({
          _id: campaign._id,
          user,
          rejectionPermlink,
        });
        await this.sponsorsBot.removeVotesOnReview({ reservationPermlink });
        await this.campaignPayment.deleteMany({
          filter: { reservationPermlink },
        });
        break;
    }
    await this.campaignSuspend.checkGuideForUnblock(guideName);
    await this.campaignPostsRepository.deleteOne({
      filter: { author: user.name, permlink: user.reviewPermlink },
    });
  }
}
