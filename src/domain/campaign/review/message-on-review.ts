import { Inject, Injectable } from '@nestjs/common';
import { configService } from '../../../common/config';
import * as crypto from 'node:crypto';
import {
  reviewMessageRejectType,
  reviewMessageSuccessType,
  ContestWinnerType,
} from './types';
import BigNumber from 'bignumber.js';
import {
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  GIVEAWAY_PARTICIPANTS_PROVIDE,
  HIVE_PROVIDE,
  PAYOUT_TOKEN_PRECISION,
  RESERVATION_STATUS,
  USER_PROVIDE,
  WOBJECT_PROVIDE,
  REVIEW_PROVIDE,
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
import { PaymentReportInterface } from '../../campaign-payment/interface';
import { CommentQueueInterface } from './interface/comment-queue.interface';

@Injectable()
export class MessageOnReview implements MessageOnReviewInterface {
  constructor(
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
    @Inject(REVIEW_PROVIDE.COMMENT_QUEUE)
    private readonly commentQueue: CommentQueueInterface,
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

    await this.commentQueue.addToQueue({
      parent_author: botName || postAuthor,
      parent_permlink: reviewPermlink,
      title: '',
      json_metadata: JSON.stringify({
        activationPermlink: campaign.activationPermlink,
      }),
      body: message,
      author: configService.getMentionsAccount(),
      permlink,
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

    await this.commentQueue.addToQueue({
      parent_author: user.rootName,
      parent_permlink: user.reviewPermlink,
      title: '',
      json_metadata: JSON.stringify({
        activationPermlink: campaign.activationPermlink,
      }),
      body: message,
      author: configService.getMentionsAccount(),
      permlink,
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
      Each winner will receive $${new BigNumber(rewardInUSD)
        .dp(2)
        .toString()} USD (${rewardInToken} ${payoutToken}) as a reward. Congratulations!
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
As a reward, you’ll receive ${new BigNumber(rewardInUSD)
      .dp(2)
      .toString()} USD (${rewardInToken} ${payoutToken}), well deserved!
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

      await this.commentQueue.addToQueue({
        parent_author: campaign.guideName,
        parent_permlink: campaign.giveawayPermlink,
        title: '',
        json_metadata: JSON.stringify({
          activationPermlink: campaign.activationPermlink,
        }),
        body: rejectMessage,
        author: configService.getGiveawayAccount(),
        permlink,
      });
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

    await this.commentQueue.addToQueue({
      parent_author: campaign.guideName,
      parent_permlink: campaign.giveawayPermlink,
      title: '',
      json_metadata: JSON.stringify({
        activationPermlink: campaign.activationPermlink,
      }),
      body: message,
      author: configService.getGiveawayAccount(),
      permlink,
    });
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
        configService.getGiveawayAccount(),
        permlink,
      );
      if (existComment?.body === message) continue;

      await this.commentQueue.addToQueue({
        parent_author: user.rootName,
        parent_permlink: user.reviewPermlink,
        title: '',
        json_metadata: JSON.stringify({
          activationPermlink: campaign.activationPermlink,
        }),
        body: message,
        author: configService.getGiveawayAccount(),
        permlink: permlink,
      });
    }
  }

  async contestWinMessage(
    _id: string,
    eventId: string,
    winners: ContestWinnerType[],
  ): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        _id,
        status: CAMPAIGN_STATUS.ACTIVE,
        type: CAMPAIGN_TYPE.CONTESTS_OBJECT,
      },
    });
    if (!campaign) return;

    const sponsorName = await this.getSponsorName(campaign.guideName);
    const sponsorNameLink = `[${sponsorName}](https://www.waivio.com/@${campaign.guideName})`;

    // Get participants list and filter out winners
    const allParticipants =
      await this.giveawayParticipantsRepository.getByNamesByActivationPermlink(
        campaign.activationPermlink,
      );
    const participants = allParticipants.filter(
      (p) => !winners.some((w) => w.post.author === p),
    );

    // Get token amounts for winners
    const tokenPrecision = PAYOUT_TOKEN_PRECISION[campaign.payoutToken];
    const payoutTokenRateUSD = await this.campaignHelper.getPayoutTokenRateUSD(
      campaign.payoutToken,
    );

    // Process winners and create messages
    for (let i = 0; i < Math.min(3, winners.length); i++) {
      const winner = winners[i];
      const place = i + 1;
      const waivAmount = new BigNumber(winner.reward)
        .dividedBy(payoutTokenRateUSD)
        .decimalPlaces(tokenPrecision)
        .toNumber();

      if (place === 1) {
        // General message for 1st place winner's post
        const winnerLines = winners.slice(0, 3).map((w, idx) => {
          const wPlace = idx + 1;
          const wWaivAmount = new BigNumber(w.reward)
            .dividedBy(payoutTokenRateUSD)
            .decimalPlaces(tokenPrecision)
            .toNumber();
          return `${wPlace}${this.getOrdinalSuffix(wPlace)} place: @${
            w.post.author
          } — $${w.reward} USD (${wWaivAmount} WAIV)`;
        });

        // Get participants list (up to 100)
        const participantsList = participants
          .slice(0, 100)
          .map((p) => `@${p}`)
          .join(', ');
        const participantsNote = participants.length > 100 ? ' ...' : '.';

        const generalMessage = `Thanks to everyone who participated in the contest campaign by ${sponsorNameLink}!
After carefully reviewing the entries and all the creative comments, we're excited to announce the winners:
${winnerLines.join('\n')}
Each winner impressed us with their unique contributions and well-thought-out posts, congratulations!
Big thanks to all participants for joining and supporting the campaign: ${participantsList}${participantsNote}
We loved seeing your insights and enthusiasm. Stay tuned for more contests, campaigns, and chances to earn!
You can track your rewards and explore active campaigns [here](https://www.waivio.com/rewards/global).
Keep creating and good luck next time!`;

        const permlink = `contest-winner-${eventId}-${place}`;
        await this.commentQueue.addToQueue({
          parent_author: winner.post.root_author,
          parent_permlink: winner.post.permlink,
          title: '',
          json_metadata: JSON.stringify({
            activationPermlink: campaign.activationPermlink,
          }),
          body: generalMessage,
          author: configService.getGiveawayAccount(),
          permlink,
        });
      } else {
        // Individual message for 2nd and 3rd place winners
        const placeText = place === 2 ? '2nd' : '3rd';
        const individualMessage = `Congratulations @${winner.post.author}!
You've secured ${placeText} place in the recent contest campaign by ${sponsorNameLink}!
As a reward, you'll receive $${winner.reward} USD (${waivAmount} WAIV), well deserved!
Thanks for your thoughtful post and participation.

Keep an eye on upcoming campaigns [here](https://www.waivio.com/rewards/global), more chances to win await!`;

        const permlink = `contest-winner-${eventId}-${place}`;
        await this.commentQueue.addToQueue({
          parent_author: winner.post.root_author,
          parent_permlink: winner.post.permlink,
          title: '',
          json_metadata: JSON.stringify({
            activationPermlink: campaign.activationPermlink,
          }),
          body: individualMessage,
          author: configService.getGiveawayAccount(),
          permlink,
        });
      }
    }
  }

  private getOrdinalSuffix(num: number): string {
    if (num >= 11 && num <= 13) return 'th';
    switch (num % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
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

    await this.commentQueue.addToQueue({
      parent_author: user.rootName,
      parent_permlink: user.reviewPermlink,
      title: '',
      json_metadata: JSON.stringify({
        activationPermlink: campaign.activationPermlink,
      }),
      body: message,
      author: configService.getGiveawayAccount(),
      permlink: permlink,
    });

    this.giveawayObjectWinMessage(campaign._id.toString(), user.eventId);
  }
}
