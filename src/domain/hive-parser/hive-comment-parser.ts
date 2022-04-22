import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { parseJSON } from '../../common/helpers';
import { HiveCommentOptionsType, HiveCommentType } from '../../common/types';
import { HiveOperationParser } from './hive-operation-parser';
import { MetadataType } from './types';
import { parserValidator } from './validators';
import { CAMPAIGN_PROVIDE, RESERVATION_PROVIDE } from '../../common/constants';
import {
  CampaignActivationInterface,
  CampaignDeactivationInterface,
} from '../campaign/interface';
import { ActivateCampaignType } from '../campaign/types';
import {
  AssignReservationInterface,
  RejectReservationInterface,
} from '../campaign/reservation/interface';

@Injectable()
export class HiveCommentParser extends HiveOperationParser {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.ACTIVATE_CAMPAIGN)
    private readonly campaignActivation: CampaignActivationInterface,
    @Inject(CAMPAIGN_PROVIDE.DEACTIVATE_CAMPAIGN)
    private readonly campaignDeactivation: CampaignDeactivationInterface,
    @Inject(RESERVATION_PROVIDE.ASSIGN)
    private readonly assignReservation: AssignReservationInterface,
    @Inject(RESERVATION_PROVIDE.REJECT)
    private readonly rejectReservation: RejectReservationInterface,
  ) {
    super();
  }

  async parse(
    comment: HiveCommentType,
    options: HiveCommentOptionsType,
  ): Promise<void> {
    const beneficiaries = _.get(
      options,
      '[1].extensions[0][1].beneficiaries',
      null,
    );
    const metadata = parseJSON(comment.json_metadata, {});
    const app = metadata?.app;

    //#TODO add set demo post handle
    //#TODO add parse review

    // await this.parseActions(
    //   comment,
    //   {
    //     waivioRewards: {
    //       type: 'stopCampaign',
    //     },
    //   },
    //   app,
    // );
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
