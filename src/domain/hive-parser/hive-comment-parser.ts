import { Injectable } from '@nestjs/common';

import _ from 'lodash';
import { parseJSON } from '../../common/helpers';
import { HiveCommentOptionsType, HiveCommentType } from '../../common/types';
import { HiveOperationParser } from './hive-operation-parser';
import { MetadataType } from './types';

@Injectable()
export class HiveCommentParser extends HiveOperationParser {
  constructor() {
    super();
  }

  async parse(
    comment: HiveCommentType,
    options: HiveCommentOptionsType,
  ): Promise<void> {
    // const beneficiaries = _.get(
    //   options,
    //   '[1].extensions[0][1].beneficiaries',
    //   null,
    // );
    const metadata = parseJSON(comment.json_metadata, {});
    const app = metadata?.app;

    //#TODO add set demo post handle
    //#TODO add parse review
    if (metadata?.waivioRewards) {
      await this.parseActions(comment, metadata, app);
    }
  }

  async parseActions(
    comment: HiveCommentType,
    metadata: MetadataType,
    app: 'string',
  ): Promise<void> {
    const { author, permlink, parent_author, parent_permlink } = comment;
    const { type } = metadata.waivioRewards;
    const postAuthor = metadata?.comment?.userId || author;

    switch (type) {
      case 'activateCampaign':
        // 'waivio_activate_campaign'
        const activate = {
          campaignId: metadata.waivioRewards.campaign_id,
          author,
          permlink,
        };
        //TODO inside activation
        // await notificationsRequest.activateCampaign(
        //   metadata.waivioRewards.campaign_id,
        // );
        break;
      case 'stopCampaign':
        //'waivio_stop_campaign':
        const inactivate = {
          campaign_permlink: parent_permlink,
          guide_name: postAuthor,
          permlink: permlink,
          //TODO get from block
          //stoppedAt: _.get(post, 'json_metadata.stoppedAt'),
        };
        //TODO inside stop campaign
        // await notificationsRequest.deactivateCampaign(
        //   metadata.waivioRewards.campaign_id,
        // );
        break;
      case 'reserveCampaign':
        //waivio_assign_campaign
        const assignData = {
          campaign_permlink: parent_permlink,
          reservation_permlink: permlink,
          user_name: postAuthor,
          root_name: author,
          approved_object: metadata.waivioRewards.approved_object,
          currencyId: metadata.waivioRewards.currencyId,
          referral_account: app,
        };
        break;
      case 'releaseReservation':
        //waivio_reject_object_campaign
        const releaseData = {
          campaign_permlink: parent_permlink,
          reservation_permlink: metadata.waivioRewards.reservation_permlink,
          unreservation_permlink: permlink,
          user_name: postAuthor,
        };
        break;
      case 'rejectReservationByGuide':
        //reject_reservation_by_guide
        const rejectReview = {
          user: parent_author,
          parent_permlink: parent_permlink,
          guideName: author,
          permlink: permlink,
        };
        break;
      case 'restoreReservationByGuide':
        //restore_reservation_by_guide
        const restoreReview = {
          user: parent_author,
          parentPermlink: parent_permlink,
          guideName: author,
          permlink: permlink,
        };
        break;

      case 'raiseReviewReward':
        //'waivio_raise_review_reward':
        const raiseReward = {
          user: parent_author,
          parentPermlink: parent_permlink,
          activationPermlink: metadata.waivioRewards.activationPermlink,
          guideName: author,
          riseAmount: metadata.waivioRewards.riseAmount,
          permlink: permlink,
        };
        break;
      case 'reduceReviewReward':
        //'waivio_reduce_review_reward':
        //TODO why only here?
        if (parent_author !== author) return;
        const reduceReward = {
          parentPermlink: parent_permlink,
          activationPermlink: metadata.waivioRewards.activationPermlink,
          userName: author,
          reduceAmount: metadata.waivioRewards.reduceAmount,
          permlink: permlink,
        };
        break;

    }
  }
}
