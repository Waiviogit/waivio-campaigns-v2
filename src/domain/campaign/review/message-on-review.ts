import { Inject, Injectable } from '@nestjs/common';
import { setTimeout } from 'timers/promises';
import { configService } from '../../../common/config';
import * as crypto from 'node:crypto';
import { reviewMessageRejectType, reviewMessageSuccessType } from './types';
import BigNumber from 'bignumber.js';
import {
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  EXPIRED_MESSAGE_TYPE,
  GIVEAWAY_PARTICIPANTS_PROVIDE,
  HIVE_PROVIDE,
  PAYOUT_TOKEN_PRECISION,
  REDIS_KEY,
  REDIS_PROVIDE,
  RESERVATION_STATUS,
  USER_PROVIDE,
  WOBJECT_PROVIDE,
} from '../../../common/constants';
import { HiveClientInterface } from '../../../services/hive-api/interface';
import { WobjectHelperInterface } from '../../wobject/interface';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import * as _ from 'lodash';
import { MessageOnReviewInterface } from './interface/message-on-review.interface';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import {
  GetGiveawayMessageInterface,
  GetGiveawayPersonalMessageInterface,
  GiveawayParticipantsRepositoryInterface,
} from '../../../persistance/giveaway-participants/interface';
import { CampaignHelperInterface } from '../interface';
import { RedisClientInterface } from '../../../services/redis/clients/interface';
import { PaymentReportInterface } from '../../campaign-payment/interface';

@Injectable()
export class MessageOnReview implements MessageOnReviewInterface {
  constructor(
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
    @Inject(HIVE_PROVIDE.CLIENT)
    private readonly hiveClient: HiveClientInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(GIVEAWAY_PARTICIPANTS_PROVIDE.REPOSITORY)
    private readonly giveawayParticipantsRepository: GiveawayParticipantsRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.PAYMENT_REPORT)
    private readonly paymentReport: PaymentReportInterface,
  ) {}
  async getPermlinkForMessage(
    author: string,
    permlink: string,
    activationPermlink: string,
  ): Promise<string> {
    const bot = configService.getMentionsAccount();
    const testCampaign = JSON.stringify({ activationPermlink });
    const result = await this.hiveClient.getState(author, permlink);

    return _.reduce(
      result?.content,
      (acc, el) => {
        if (el.author !== bot) return acc;
        if (el.json_metadata !== testCampaign) return acc;
        acc = el.permlink;
        return acc;
      },
      `re-${crypto.randomUUID()}`,
    );
  }

  private async getLegalMessage(
    campaign: CampaignDocumentType,
  ): Promise<string> {
    const hasLegal =
      campaign.description ||
      campaign?.agreementObjects?.length ||
      campaign.usersLegalNotice;

    if (!hasLegal) return '';

    const objectNamesMap: Record<string, string> = {};
    const mapNames = async (el: string): Promise<void> => {
      objectNamesMap[el] = await this.wobjectHelper.getWobjectName(el);
    };
    await Promise.all(campaign.agreementObjects.map(mapNames));

    let legalAgreement = 'Important:';
    if (campaign.description) {
      legalAgreement += `\n${campaign.description}`;
    }
    if (campaign.agreementObjects?.length) {
      legalAgreement += `\nLegal: ${campaign.agreementObjects
        .map((o) => `[${objectNamesMap[o]}](https://waivio.com/object/${o})`)
        .join(', ')}.`;
    }
    if (campaign.usersLegalNotice) {
      legalAgreement += `\n${campaign.usersLegalNotice}`;
    }

    return legalAgreement;
  }

  async sendMessageSuccessReview({
    campaign,
    userReservationObject,
    reviewPermlink,
    postAuthor,
    botName,
    reservationPermlink,
  }: reviewMessageSuccessType): Promise<void> {
    const sponsor = await this.userRepository.findOne({
      filter: { name: campaign.guideName },
    });

    const legalAgreement = await this.getLegalMessage(campaign);
    const linksToObjects = [];

    const objects = _.compact(
      _.uniq([campaign.requiredObject, userReservationObject]),
    );

    const report = await this.paymentReport.getSingleReport({
      guideName: campaign.guideName,
      userName: postAuthor,
      reviewPermlink,
      reservationPermlink,
      host: configService.getAppHost(),
      payoutToken: campaign.payoutToken,
    });
    if (!report) return;

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
    const twoOrMorePhotos = campaign?.requirements?.minPhotos > 1;

    let message = `Thanks for your post! Since you mentioned ${linksToObjects.join(
      ', ',
    )}${
      twoOrMorePhotos ? ' and included two or more photos' : ''
    }, you’re eligible for potential rewards of $${new BigNumber(
      campaign.rewardInUSD,
    )
      .dp(2)
      .toString()} USD (${report.rewardTokenAmount} ${
      campaign.payoutToken
    }) from [${sponsor.alias || sponsor.name}](https://www.waivio.com/@${
      campaign.guideName
    })! 
Your post will be reviewed, and if it meets quality standards, the reward will be yours. 
You can track all of your outstanding payments and discover many more rewards [here](https://www.waivio.com/rewards/global). Keep sharing great content!`;

    if (legalAgreement) message += `\n\n${legalAgreement}`;

    const permlink = await this.getPermlinkForMessage(
      botName || postAuthor,
      reviewPermlink,
      campaign.activationPermlink,
    );

    await this.hiveClient.createComment({
      parent_author: botName || postAuthor,
      parent_permlink: reviewPermlink,
      title: '',
      json_metadata: JSON.stringify({
        activationPermlink: campaign.activationPermlink,
      }),
      body: message,
      author: configService.getMentionsAccount(),
      permlink,
      key: configService.getMessagePostingKey(),
    });
  }

  async rejectMentionMessage({
    guideName,
    reservationPermlink,
  }: reviewMessageRejectType): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        guideName: guideName,
        users: {
          $elemMatch: { reservationPermlink },
        },
      },
    });

    const user = _.find(
      campaign?.users,
      (user) => user.reservationPermlink === reservationPermlink,
    );
    if (!user) return;

    const report = await this.paymentReport.getSingleReport({
      guideName: campaign.guideName,
      userName: user.name,
      reviewPermlink: user.reviewPermlink,
      reservationPermlink,
      host: configService.getAppHost(),
      payoutToken: campaign.payoutToken,
    });
    if (!report) return;

    const sponsor = await this.userRepository.findOne({
      filter: { name: campaign.guideName },
    });

    const linksToObjects = [];

    const objects = _.uniq([campaign.requiredObject, user.objectPermlink]);

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

    const twoOrMorePhotos = campaign?.requirements?.minPhotos > 1;

    const message = `Thank you for mentioning ${linksToObjects.join(', ')}${
      twoOrMorePhotos ? ' and sharing two or more photos' : ''
    }. Unfortunately, [${
      sponsor.alias || sponsor.name
    }](https://www.waivio.com/@${
      campaign.guideName
    }) has determined that your post did not meet the quality standards required to receive the sponsored rewards of $${new BigNumber(
      campaign.rewardInUSD,
    )
      .dp(2)
      .toString()} USD (${report.rewardTokenAmount} ${
      campaign.payoutToken
    }) this time.
We encourage you to create and share original content to qualify for rewards in the future. You can discover more rewards [here](https://www.waivio.com/rewards/global). Keep creating and sharing!`;

    const permlink = await this.getPermlinkForMessage(
      user.rootName,
      user.reviewPermlink,
      campaign.activationPermlink,
    );

    await this.hiveClient.createComment({
      parent_author: user.rootName,
      parent_permlink: user.reviewPermlink,
      title: '',
      json_metadata: JSON.stringify({
        activationPermlink: campaign.activationPermlink,
      }),
      body: message,
      author: configService.getMentionsAccount(),
      permlink,
      key: configService.getMessagePostingKey(),
    });
  }

  async getSponsorName(guideName: string): Promise<string> {
    const sponsor = await this.userRepository.findOne({
      filter: { name: guideName },
      projection: {
        alias: 1,
        name: 1,
      },
    });
    if (!sponsor) return guideName;
    return sponsor.alias || sponsor.name;
  }

  getGiveawayUsualMessage({
    guideName,
    sponsorName,
    payoutToken,
    legalAgreement,
    rewardInToken,
    rewardInUSD,
    winners,
    participants,
  }: GetGiveawayMessageInterface): string {
    let message = `Thanks to everyone who participated in this giveaway campaign from [${sponsorName}](https://www.waivio.com/@${guideName})!
    The campaign has ended, and the results are in. Out of all the amazing participants, we’ve randomly selected the winners: ${winners
      .map((w) => `@${w}`)
      .join(', ')}.
      Each winner will receive $${rewardInUSD} USD (${rewardInToken} ${payoutToken}) as a reward. Congratulations!
    `;

    if (participants.length > 0) {
      message += `Big thanks to all participants for joining and supporting the campaign: ${participants
        .map((w) => `@${w}`)
        .join(', ')}.\n`;
    }
    message += `Thank you all for joining and sharing great content!
Keep an eye out for new campaigns, giveaways, and chances to earn more rewards. You can track your current rewards and explore active campaigns [here](https://www.waivio.com/rewards/global).

Keep creating and good luck next time!`;
    if (legalAgreement) message += `\n\n${legalAgreement}`;

    return message;
  }

  getPersonalGiveawayMessage({
    sponsorName,
    guideName,
    rewardInUSD,
    rewardInToken,
    payoutToken,
    legalAgreement,
    userName,
  }: GetGiveawayPersonalMessageInterface): string {
    let message = `Congratulations @${userName}!

You’ve been selected as one of the winners in the giveaway campaign by [${sponsorName}](https://www.waivio.com/@${guideName})!

As a reward, you’ll receive ${rewardInUSD} USD (${rewardInToken} ${payoutToken}), well deserved!

Thanks again for participating and sharing great content.
Stay tuned for more campaigns and opportunities to earn. You can explore active giveaways and track your rewards [here](https://www.waivio.com/rewards/global).

Keep creating and good luck in the next one!`;

    if (legalAgreement) message += `\n\n${legalAgreement}`;

    return message;
  }

  //giveaway on post its same comment can be updated when guide reject users
  async giveawayMessage(activationPermlink: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        activationPermlink,
        type: CAMPAIGN_TYPE.GIVEAWAYS,
        status: CAMPAIGN_STATUS.EXPIRED,
      },
    });
    if (!campaign) return;

    const rewardsApplicants = campaign.users.map((el) => el.name);
    if (rewardsApplicants.length === 0) return;
    const sponsorName = await this.getSponsorName(campaign.guideName);

    const winners = campaign.users
      .filter((u) => u.status === RESERVATION_STATUS.COMPLETED)
      .map((el) => el.name);

    const permlink = `giveaway-${campaign.activationPermlink}`;
    if (winners.length === 0) {
      const rejectMessage = `Thanks to everyone who participated in this giveaway campaign from [${sponsorName}](https://www.waivio.com/@${campaign.guideName})!

Unfortunately, the sponsor has decided not to approve the results of this giveaway, and no rewards will be distributed this time.
We understand this may be disappointing, and we truly appreciate the effort and creativity you put into your content.

We encourage you to keep sharing your ideas and participating in future campaigns. There are always new opportunities to earn rewards and get recognized.

You can track your activity and discover new campaigns [here](https://www.waivio.com/rewards/global).
Thank you again for being part of the community!

Keep creating and stay inspired!`;

      const messageIsSent = await this.hiveClient.createComment({
        parent_author: campaign.guideName,
        parent_permlink: campaign.giveawayPermlink,
        title: '',
        json_metadata: JSON.stringify({
          activationPermlink: campaign.activationPermlink,
        }),
        body: rejectMessage,
        author: configService.getGiveawayAccount(),
        permlink,
        key: configService.getMessagePostingKey(),
      });
      if (!messageIsSent) {
        await this.setExpireTTLGiveaway(campaign.activationPermlink);
      }

      console.log('SEND MESSAGE GIVEAWAY REJECT');
      return;
    }
    //filter winners
    const participants = (
      await this.giveawayParticipantsRepository.getByNamesByActivationPermlink(
        campaign.activationPermlink,
      )
    ).filter((el) => !winners.includes(el));
    const legalAgreement = await this.getLegalMessage(campaign);
    const tokenPrecision = PAYOUT_TOKEN_PRECISION[campaign.payoutToken];
    const payoutTokenRateUSD = await this.campaignHelper.getPayoutTokenRateUSD(
      campaign.payoutToken,
    );
    const rewardInToken = new BigNumber(campaign.rewardInUSD)
      .dividedBy(payoutTokenRateUSD)
      .decimalPlaces(tokenPrecision)
      .toNumber();

    const message = this.getGiveawayUsualMessage({
      guideName: campaign.guideName,
      sponsorName,
      payoutToken: campaign.payoutToken,
      legalAgreement,
      rewardInToken,
      rewardInUSD: campaign.rewardInUSD,
      winners,
      participants,
    });

    const messageIsSent = await this.hiveClient.createComment({
      parent_author: campaign.guideName,
      parent_permlink: campaign.giveawayPermlink,
      title: '',
      json_metadata: JSON.stringify({
        activationPermlink: campaign.activationPermlink,
      }),
      body: message,
      author: configService.getGiveawayAccount(),
      permlink,
      key: configService.getMessagePostingKey(),
    });
    if (!messageIsSent) {
      await this.setExpireTTLGiveaway(campaign.activationPermlink);
    }

    console.log(`SEND MESSAGE GIVEAWAY ${messageIsSent}`);
  }

  async giveawayObjectWinMessage(_id: string, eventId: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        _id,
        type: CAMPAIGN_TYPE.GIVEAWAYS_OBJECT,
      },
    });
    if (!campaign) return;
    const usersCompleted = campaign.users.filter(
      (u) =>
        u?.eventId === eventId && u.status === RESERVATION_STATUS.COMPLETED,
    );
    if (!usersCompleted?.length) return;
    const participants = (
      await this.giveawayParticipantsRepository.getByNamesByActivationPermlinkEventId(
        campaign.activationPermlink,
        eventId,
      )
    ).filter((el) => !usersCompleted.map((u) => u.name).includes(el));

    const sponsorName = await this.getSponsorName(campaign.guideName);
    const legalAgreement = await this.getLegalMessage(campaign);
    const tokenPrecision = PAYOUT_TOKEN_PRECISION[campaign.payoutToken];
    const payoutTokenRateUSD = await this.campaignHelper.getPayoutTokenRateUSD(
      campaign.payoutToken,
    );
    const rewardInToken = new BigNumber(campaign.rewardInUSD)
      .dividedBy(payoutTokenRateUSD)
      .decimalPlaces(tokenPrecision)
      .toNumber();

    for (const [index, user] of usersCompleted.entries()) {
      const permlink = `${user.name}-${eventId}`;

      const message =
        index === 0
          ? this.getGiveawayUsualMessage({
              guideName: campaign.guideName,
              sponsorName,
              payoutToken: campaign.payoutToken,
              legalAgreement,
              rewardInToken,
              rewardInUSD: campaign.rewardInUSD,
              winners: usersCompleted.map((el) => el.name),
              participants,
            })
          : this.getPersonalGiveawayMessage({
              guideName: campaign.guideName,
              sponsorName,
              payoutToken: campaign.payoutToken,
              legalAgreement,
              rewardInToken,
              rewardInUSD: campaign.rewardInUSD,
              userName: user.name,
            });

      const existComment = await this.hiveClient.getContent(
        configService.getMentionsAccount(),
        permlink,
      );
      if (existComment?.body === message) continue;

      await this.hiveClient.createComment({
        parent_author: user.rootName,
        parent_permlink: user.reviewPermlink,
        title: '',
        json_metadata: JSON.stringify({
          activationPermlink: campaign.activationPermlink,
        }),
        body: message,
        author: configService.getMentionsAccount(),
        permlink: permlink,
        key: configService.getMessagePostingKey(),
      });

      //we can comment once in 3 seconds with 1 account
      await setTimeout(5 * 1000);
    }
  }

  async rejectMessageObjectGiveaway(
    activationPermlink: string,
    reservationPermlink: string,
  ): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        activationPermlink,
        type: CAMPAIGN_TYPE.GIVEAWAYS_OBJECT,
      },
    });
    if (!campaign) return;
    const user = campaign.users.find(
      (u) => u.reservationPermlink === reservationPermlink,
    );
    if (!user) return;

    const sponsorName = await this.getSponsorName(campaign.guideName);
    const tokenPrecision = PAYOUT_TOKEN_PRECISION[campaign.payoutToken];
    const payoutTokenRateUSD = await this.campaignHelper.getPayoutTokenRateUSD(
      campaign.payoutToken,
    );
    const rewardInToken = new BigNumber(campaign.rewardInUSD)
      .dividedBy(payoutTokenRateUSD)
      .decimalPlaces(tokenPrecision)
      .toNumber();

    const message = `Thank you for participating in giveaway. Unfortunately, [${sponsorName}](https://www.waivio.com/@${
      campaign.guideName
    }) has determined that your post did not meet the quality standards required to receive the sponsored rewards of $${new BigNumber(
      campaign.rewardInUSD,
    )
      .dp(2)
      .toString()} USD (${rewardInToken} ${campaign.payoutToken}) this time.
We encourage you to create and share original content to qualify for rewards in the future. You can discover more rewards [here](https://www.waivio.com/rewards/global). Keep creating and sharing!`;

    const permlink = `${user.name}-${user.eventId}`;

    await this.hiveClient.createComment({
      parent_author: user.rootName,
      parent_permlink: user.reviewPermlink,
      title: '',
      json_metadata: JSON.stringify({
        activationPermlink: campaign.activationPermlink,
      }),
      body: message,
      author: configService.getMentionsAccount(),
      permlink: permlink,
      key: configService.getMessagePostingKey(),
    });

    await setTimeout(5 * 1000);

    this.giveawayObjectWinMessage(campaign._id.toString(), user.eventId);
  }

  private async setExpireTTLGiveaway(
    activationPermlink: string,
  ): Promise<void> {
    const expire = 60;
    await this.campaignRedisClient.setex(
      `${REDIS_KEY.GIVEAWAY_MESSAGE_EXPIRE}${activationPermlink}`,
      expire,
      '',
    );
  }

  async listener(key: string): Promise<void> {
    const [, type, id] = key.split(':');
    switch (type) {
      case EXPIRED_MESSAGE_TYPE.GIVEAWAY:
        return this.giveawayMessage(id);
      default:
        return;
    }
  }
}
