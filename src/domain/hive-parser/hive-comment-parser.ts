import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { parseJSON } from '../../common/helpers';
import { HiveCommentType } from '../../common/types';
import { HiveCommentParseType, MetadataType } from './types';
import { parserValidator } from './validators';
import {
  CAMPAIGN_PROVIDE,
  REDIS_KEY,
  REDIS_PROVIDE,
  RESERVATION_PROVIDE,
  REVIEW_PROVIDE,
} from '../../common/constants';
import {
  CampaignActivationInterface,
  CampaignDeactivationInterface,
  CampaignHelperInterface,
} from '../campaign/interface';
import { ActivateCampaignType } from '../campaign/types';
import {
  AssignReservationInterface,
  GuideRejectReservationInterface,
  RejectReservationInterface,
  ReservationHelperInterface,
} from '../campaign/reservation/interface';
import { CreateReviewInterface } from '../campaign/review/interface';
import { HiveCommentParserInterface } from './interface';
import { RedisClientInterface } from '../../services/redis/clients/interface';

@Injectable()
export class HiveCommentParser implements HiveCommentParserInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.ACTIVATE_CAMPAIGN)
    private readonly campaignActivation: CampaignActivationInterface,
    @Inject(CAMPAIGN_PROVIDE.DEACTIVATE_CAMPAIGN)
    private readonly campaignDeactivation: CampaignDeactivationInterface,
    @Inject(RESERVATION_PROVIDE.ASSIGN)
    private readonly assignReservation: AssignReservationInterface,
    @Inject(RESERVATION_PROVIDE.REJECT)
    private readonly rejectReservation: RejectReservationInterface,
    @Inject(RESERVATION_PROVIDE.GUIDE_REJECT)
    private readonly guideRejectReservation: GuideRejectReservationInterface,
    @Inject(REVIEW_PROVIDE.CREATE)
    private readonly createReview: CreateReviewInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
    @Inject(RESERVATION_PROVIDE.HELPER)
    private readonly reservationHelper: ReservationHelperInterface,
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
  ) {}

  async parse({
    comment,
    options,
    transaction_id,
  }: HiveCommentParseType): Promise<void> {
    const extensions = _.get(options, '[1].extensions', null);
    const beneficiaries = _.get(extensions, '[0][1].beneficiaries', []);

    const metadata = parseJSON(comment.json_metadata, {});
    const app = metadata?.app;

    //#TODO add set demo post handle
    await this.createReview.parseReview({
      comment,
      metadata,
      app,
      beneficiaries,
    });

    if (metadata?.waivioRewards) {
      await this.parseActions(comment, metadata, app, transaction_id);
    }

    await this.reservationHelper.parseReservationConversation({
      comment,
      metadata,
    });
  }

  async parseActions(
    comment: HiveCommentType,
    metadata: MetadataType,
    app: string,
    transaction_id: string,
  ): Promise<void> {
    const { author, permlink, parent_author, parent_permlink } = comment;
    const { type } = metadata.waivioRewards;
    const postAuthor = metadata?.comment?.userId || author;

    switch (type) {
      case 'activateCampaign':
        const activationParams =
          await parserValidator.validateCampaignActivation(
            metadata.waivioRewards.campaignId,
            author,
            permlink,
          );
        if (activationParams) {
          await this.campaignActivation.activate(
            activationParams as ActivateCampaignType,
          );
        }
        break;
      case 'stopCampaign':
        await this.campaignDeactivation.deactivate({
          activationPermlink: parent_permlink,
          deactivationPermlink: permlink,
          guideName: postAuthor,
        });
        break;
      case 'reserveCampaign':
        await this.assignReservation.assign({
          activationPermlink: parent_permlink,
          reservationPermlink: permlink,
          name: postAuthor,
          rootName: author,
          requiredObject: metadata.waivioRewards.requiredObject,
          referralServer: app,
        });
        break;
      case 'rejectReservation':
        await this.rejectReservation.rejectReservation({
          activationPermlink: parent_permlink,
          reservationPermlink: metadata.waivioRewards.reservationPermlink,
          rejectionPermlink: permlink,
          name: postAuthor,
        });
        break;
      case 'rejectReservationByGuide':
        await this.guideRejectReservation.reject({
          reservationPermlink: parent_permlink,
          guideName: author,
          rejectionPermlink: permlink,
        });
        await this.campaignRedisClient.publish(
          REDIS_KEY.PUBLISH_EXPIRE_TRX_ID,
          transaction_id,
        );
        break;
      case 'restoreReservationByGuide':
        await this.createReview.restoreReview({
          user: parent_author,
          parentPermlink: parent_permlink,
          guideName: author,
        });
        await this.campaignRedisClient.publish(
          REDIS_KEY.PUBLISH_EXPIRE_TRX_ID,
          transaction_id,
        );
        break;
      case 'raiseReviewReward':
        await this.createReview.raiseReward({
          user: parent_author,
          parentPermlink: parent_permlink,
          activationPermlink: metadata.waivioRewards.activationPermlink,
          guideName: author,
          riseAmount: metadata.waivioRewards.riseAmount,
          permlink: permlink,
        });
        await this.campaignRedisClient.publish(
          REDIS_KEY.PUBLISH_EXPIRE_TRX_ID,
          transaction_id,
        );
        break;
      case 'reduceReviewReward':
        if (parent_author !== author) return;
        await this.createReview.reduceReward({
          parentPermlink: parent_permlink,
          activationPermlink: metadata.waivioRewards.activationPermlink,
          user: author,
          reduceAmount: metadata.waivioRewards.reduceAmount,
          permlink: permlink,
        });
        await this.campaignRedisClient.publish(
          REDIS_KEY.PUBLISH_EXPIRE_TRX_ID,
          transaction_id,
        );
        break;
    }
  }
}
