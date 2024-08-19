import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import {
  ParseReservationConversationInterface,
  ReservationHelperInterface,
} from './interface';
import {
  CAMPAIGN_COMMENT_PARSER_ACTIONS,
  CAMPAIGN_PROVIDE,
  NOTIFICATION_ID,
  NOTIFICATIONS_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import { NotificationsInterface } from '../../notifications/interface';
import { CampaignHelperInterface } from '../interface';

const CAMPAIGNS_META = [
  'waivio_activate_campaign',
  'waivio_stop_campaign',
  'stopCampaign',
  'activateCampaign',
  'createMessageThread',
];

@Injectable()
export class ReservationHelper implements ReservationHelperInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(NOTIFICATIONS_PROVIDE.SERVICE)
    private readonly notifications: NotificationsInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async parseMessageThread({
    comment,
    metadata,
  }: ParseReservationConversationInterface): Promise<void> {
    const reservationPermlink = metadata.waivioRewards.reservationPermlink;

    const campaign = await this.campaignRepository.findOne({
      filter: {
        users: { $elemMatch: { reservationPermlink } },
      },
      projection: {
        'users.$': 1,
        guideName: 1,
        name: 1,
      },
    });
    if (!campaign) return;

    const [user] = campaign.users;
    if (!user.messagesPermlink) return;
    const guestAuthor = _.get(metadata, 'comment.userId');
    const author = guestAuthor ? guestAuthor : comment.author;
    await this.notifications.sendNotification({
      id: NOTIFICATION_ID.CAMPAIGN_MESSAGE,
      data: {
        ...comment,
        author,
        guideName: campaign.guideName,
        campaignName: campaign.name,
        reservedUser: _.get(campaign, 'users[0].name'),
        newCampaigns: true,
        reservationPermlink,
      },
    });

    const [rootName, rootPermlink] = user.messagesPermlink.split('/');

    await this.campaignHelper.incrReviewComment({
      author: comment.author,
      permlink: comment.permlink,
      reservationPermlink: reservationPermlink,
      isOpen: comment.author !== campaign.guideName,
      rootName,
      rootPermlink,
    });
  }

  async parseReservationConversation({
    comment,
    metadata,
  }: ParseReservationConversationInterface): Promise<void> {
    if (CAMPAIGNS_META.includes(_.get(metadata, 'waivioRewards.type'))) return;
    if (
      _.get(metadata, 'waivioRewards.type') ===
      CAMPAIGN_COMMENT_PARSER_ACTIONS.CAMPAIGN_MESSAGE
    ) {
      return this.parseMessageThread({ comment, metadata });
    }

    const campaign = await this.campaignRepository.findOne({
      filter: {
        users: { $elemMatch: { reservationPermlink: comment.parent_permlink } },
      },
      projection: {
        'users.$': 1,
        guideName: 1,
        name: 1,
      },
    });
    if (!campaign) return;
    const guestAuthor = _.get(metadata, 'comment.userId');
    const author = guestAuthor ? guestAuthor : comment.author;
    await this.notifications.sendNotification({
      id: NOTIFICATION_ID.CAMPAIGN_MESSAGE,
      data: {
        ...comment,
        author,
        guideName: campaign.guideName,
        campaignName: campaign.name,
        reservedUser: _.get(campaign, 'users[0].name'),
        newCampaigns: true,
      },
    });

    await this.campaignHelper.incrReviewComment({
      author: comment.author,
      permlink: comment.permlink,
      rootName: comment.parent_author,
      reservationPermlink: comment.parent_permlink,
      isOpen: comment.author !== campaign.guideName,
    });
  }
}
