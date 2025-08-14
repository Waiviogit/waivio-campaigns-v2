import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  GIVEAWAY_PARTICIPANTS_PROVIDE,
  POST_PROVIDE,
  RECURRENT_TYPE,
  REDIS_KEY,
  REDIS_PROVIDE,
  REVIEW_PROVIDE,
  USER_PROVIDE,
} from '../../../common/constants';
import { RedisClientInterface } from '../../../services/redis/clients/interface';
import { rrulestr } from 'rrule';
import { GiveawayObjectInterface } from './interface/giveaway-object.interface';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import { PostRepositoryInterface } from '../../../persistance/post/interface';
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import BigNumber from 'bignumber.js';
import { selectRandomWinner } from '../../../common/helpers/randomHelper';
import { GiveawayParticipantsRepositoryInterface } from '../../../persistance/giveaway-participants/interface';
import { CampaignHelperInterface } from '../interface';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import { CreateReviewInterface } from '../review/interface';
import * as crypto from 'node:crypto';
import { MessageOnReviewInterface } from '../review/interface/message-on-review.interface';

@Injectable()
export class GiveawayObject implements GiveawayObjectInterface {
  constructor(
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(POST_PROVIDE.REPOSITORY)
    private readonly postRepository: PostRepositoryInterface,
    @Inject(GIVEAWAY_PARTICIPANTS_PROVIDE.REPOSITORY)
    private readonly giveawayParticipantsRepository: GiveawayParticipantsRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(REVIEW_PROVIDE.CREATE)
    private readonly createReview: CreateReviewInterface,
    @Inject(REVIEW_PROVIDE.MESSAGE_ON_REVIEW)
    private readonly messageOnReview: MessageOnReviewInterface,
  ) {}
  async setNextRecurrentEvent(rruleString: string, _id: string): Promise<void> {
    const rruleObject = rrulestr(rruleString);
    const now = new Date();
    const next = rruleObject.after(now, true);
    if (!next) {
      await this.campaignHelper.setExpireTTLCampaign(
        new Date(now.getTime() + 5 * 1000),
        _id,
      );
      return;
    }
    const expire = Math.max(
      0,
      Math.floor((next.getTime() - now.getTime()) / 1000),
    );
    await this.campaignRedisClient.setex(
      `${REDIS_KEY.GIVEAWAY_OBJECT_RECURRENT}${_id}`,
      expire,
      '',
    );
  }

  async getParticipants(campaign: CampaignDocumentType): Promise<string[]> {
    // Get posts within campaign duration and objects
    const dateFrom = moment().subtract(campaign.durationDays, 'd').toDate();
    const posts = await this.postRepository.find({
      filter: {
        createdAt: { $gte: dateFrom },
        'wobjects.author_permlink': { $in: campaign.objects },
      },
      projection: {
        author: 1,
        permlink: 1,
      },
    });

    // Unique authors
    const authors = [...new Set(posts.map((p) => p.author))];
    if (!authors.length) return [];

    // Fetch user data for all authors
    const users = await this.userRepository.find({
      filter: { name: { $in: authors } },
      projection: {
        name: 1,
        count_posts: 1,
        followers_count: 1,
        wobjects_weight: 1,
      },
    });
    const userMap = new Map(users.map((u) => [u.name, u]));

    // Blacklist/whitelist logic
    const blacklist = (campaign.blacklistUsers || []).filter(
      (u: string) => !(campaign.whitelistUsers || []).includes(u),
    );

    // Already assigned/completed users
    type CampaignUser = { name: string; status: string; updatedAt?: Date };
    const assignedOrCompleted = new Set(
      ((campaign.users || []) as CampaignUser[])
        .filter((u) => ['assigned', 'completed'].includes(u.status))
        .map((u) => u.name),
    );

    // Frequency logic: map of userName -> last completed date
    const completedMap = new Map();
    ((campaign.users || []) as CampaignUser[]).forEach((u) => {
      if (u.status === 'completed') {
        if (
          !completedMap.has(u.name) ||
          completedMap.get(u.name) < u.updatedAt
        ) {
          completedMap.set(u.name, u.updatedAt);
        }
      }
    });

    const now = moment.utc();
    const eligible: string[] = [];
    for (const author of authors) {
      const user = userMap.get(author);
      if (!user) continue;
      // Requirements
      if (
        (campaign.userRequirements?.minPosts &&
          user.count_posts < campaign.userRequirements.minPosts) ||
        (campaign.userRequirements?.minFollowers &&
          user.followers_count < campaign.userRequirements.minFollowers) ||
        (campaign.userRequirements?.minExpertise &&
          user.wobjects_weight < campaign.userRequirements.minExpertise)
      ) {
        continue;
      }
      // Blacklist
      if (blacklist.includes(author)) continue;
      // Already assigned/completed
      if (assignedOrCompleted.has(author)) continue;
      // Frequency
      if (campaign.frequencyAssign && completedMap.has(author)) {
        const lastCompleted = moment(completedMap.get(author));
        const daysPassed = now.diff(lastCompleted, 'days');
        if (daysPassed < campaign.frequencyAssign) continue;
      }
      eligible.push(author);
    }
    return eligible;
  }

  async startGiveaway(_id: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        _id,
        status: CAMPAIGN_STATUS.ACTIVE,
        type: CAMPAIGN_TYPE.GIVEAWAYS_OBJECT,
      },
    });
    if (!campaign) return;
    if (!campaign.recurrenceRule) return;

    const rruleObject = rrulestr(campaign.recurrenceRule);
    const now = new Date();
    // Use a window of ±1 day and range ±1 minute
    const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const occurrences = rruleObject.between(windowStart, windowEnd, true);
    const isInRange = occurrences.some(
      (date) => Math.abs(date.getTime() - now.getTime()) <= 60 * 1000,
    );
    if (!isInRange) return;

    let participants = await this.getParticipants(campaign);
    const eventId = crypto.randomUUID();

    await this.giveawayParticipantsRepository.insertMany(
      participants.map((p) => ({
        userName: p,
        activationPermlink: campaign.activationPermlink,
        eventId,
      })),
    );

    let budget = BigNumber(campaign.budget);
    let winnersCount = 0;

    while (
      budget.gte(campaign.reward) &&
      participants.length &&
      winnersCount < campaign.winnersNumber
    ) {
      const winner = selectRandomWinner(participants);
      const lastPost = await this.postRepository.findOne({
        filter: {
          author: winner,
          'wobjects.author_permlink': { $in: campaign.objects },
        },
        options: {
          sort: {
            _id: -1,
          },
        },
      });
      if (!lastPost) continue;
      await this.createReview.createGiveawayPayables({
        campaign,
        userName: winner,
        post: lastPost,
        eventId,
      });
      winnersCount++;
      participants = participants.filter((p) => p !== winner);

      budget = budget.minus(campaign.reward);
    }

    await this.setNextRecurrentEvent(campaign.recurrenceRule, _id);
    this.messageOnReview.giveawayObjectWinMessage(_id, eventId);
  }

  async listener(key: string): Promise<void> {
    const [, type, id] = key.split(':');
    switch (type) {
      case RECURRENT_TYPE.GIVEAWAY_OBJECT:
        return this.startGiveaway(id);
      default:
        return;
    }
  }
}
