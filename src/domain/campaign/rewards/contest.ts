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
import { ContestInterface } from './interface';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import { PostRepositoryInterface } from '../../../persistance/post/interface';
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import { PostDocumentType } from '../../../persistance/post/types';
import { CampaignHelperInterface } from '../interface';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import { CreateReviewInterface } from '../review/interface';
import { GiveawayParticipantsRepositoryInterface } from '../../../persistance/giveaway-participants/interface';
import * as crypto from 'node:crypto';
import { MessageOnReviewInterface } from '../review/interface/message-on-review.interface';
import { ContestWinnerType } from '../review/types';
import { castToUTC } from '../../../common/helpers';

@Injectable()
export class Contest implements ContestInterface {
  constructor(
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(POST_PROVIDE.REPOSITORY)
    private readonly postRepository: PostRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(REVIEW_PROVIDE.CREATE)
    private readonly createReview: CreateReviewInterface,
    @Inject(REVIEW_PROVIDE.MESSAGE_ON_REVIEW)
    private readonly messageOnReview: MessageOnReviewInterface,
    @Inject(GIVEAWAY_PARTICIPANTS_PROVIDE.REPOSITORY)
    private readonly giveawayParticipantsRepository: GiveawayParticipantsRepositoryInterface,
  ) {}

  async setNextRecurrentEvent(
    rruleString: string,
    _id: string,
    timezone?: string,
  ): Promise<void> {
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
    const nextUtc = castToUTC({
      date: next,
      timezone: timezone,
    });

    const expire = Math.max(
      0,
      Math.floor((nextUtc.getTime() - now.getTime()) / 1000),
    );
    await this.campaignRedisClient.setex(
      `${REDIS_KEY.CONTEST_OBJECT_RECURRENT}${_id}`,
      expire,
      '',
    );
  }

  async getContestParticipants(
    campaign: CampaignDocumentType,
  ): Promise<string[]> {
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

  async getContestPosts(
    campaign: CampaignDocumentType,
  ): Promise<PostDocumentType[]> {
    // Get posts within campaign duration and objects
    const dateFrom = moment().subtract(campaign.durationDays, 'd').toDate();
    const posts = await this.postRepository.find({
      filter: {
        createdAt: { $gte: dateFrom },
        'wobjects.author_permlink': { $in: campaign.objects },
        author: { $nin: [...campaign.blacklistUsers, campaign.guideName] },
      },
      projection: {
        author: 1,
        permlink: 1,
        title: 1,
        json_metadata: 1,
        beneficiaries: 1,
        active_votes: 1,
        root_author: 1,
      },
    });

    return posts;
  }

  async getJudgeVotes(
    campaign: CampaignDocumentType,
    posts: PostDocumentType[],
  ): Promise<Map<string, number>> {
    const votes = new Map<string, number>();

    // Initialize votes for all posts
    posts.forEach((post) => {
      votes.set(`${post.author}/${post.permlink}`, 0);
    });

    // Get judges (campaign creator is default judge)
    const judges = [campaign.guideName, ...(campaign.contestJudges || [])];

    // Calculate judge votes from post.active_votes
    for (const post of posts) {
      const postKey = `${post.author}/${post.permlink}`;
      let judgeVotes = 0;

      // Check if post has active_votes
      if (post.active_votes && Array.isArray(post.active_votes)) {
        for (const vote of post.active_votes) {
          if (judges.includes(vote.voter)) {
            judgeVotes += vote.percent || 0;
          }
        }
      }

      votes.set(postKey, judgeVotes);
    }

    return votes;
  }

  async startContest(_id: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        _id,
        status: CAMPAIGN_STATUS.ACTIVE,
        type: CAMPAIGN_TYPE.CONTESTS_OBJECT,
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
    if (!isInRange) {
      await this.setNextRecurrentEvent(
        campaign.recurrenceRule,
        _id,
        campaign.recurrenceRule,
      );
      return;
    }

    const posts = await this.getContestPosts(campaign);
    if (!posts.length) {
      await this.setNextRecurrentEvent(
        campaign.recurrenceRule,
        _id,
        campaign.recurrenceRule,
      );
      return;
    }

    const judgeVotes = await this.getJudgeVotes(campaign, posts);
    const eventId = crypto.randomUUID();

    // Calculate vote percentages and sort posts by judge vote percentage
    const judges = [campaign.guideName, ...(campaign.contestJudges || [])];
    const totalJudges = judges.length;

    const postsWithVotePercentage = posts.map((post) => {
      const votes = judgeVotes.get(`${post.author}/${post.permlink}`) || 0;
      const votePercentage = totalJudges > 0 ? (votes / totalJudges) * 100 : 0;

      return {
        post,
        votes,
        votePercentage,
      };
    });

    // Sort by vote percentage (descending), then by votes (descending)
    const sortedPosts = postsWithVotePercentage.sort((a, b) => {
      if (a.votePercentage !== b.votePercentage) {
        return b.votePercentage - a.votePercentage;
      }
      return b.votes - a.votes;
    });

    // Determine winners based on contest rewards
    const winners: ContestWinnerType[] = [];
    const winningAuthors = new Set<string>();
    const contestRewards = campaign.contestRewards || [];

    for (
      let i = 0;
      i < Math.min(contestRewards.length, sortedPosts.length);
      i++
    ) {
      const reward = contestRewards[i];

      // Find the next eligible post (author hasn't won yet)
      let eligiblePostData = null;
      for (const postData of sortedPosts) {
        if (!winningAuthors.has(postData.post.author)) {
          eligiblePostData = postData;
          break;
        }
      }

      if (!eligiblePostData) {
        // No more eligible authors, break the loop
        break;
      }

      // If no votes or tied votes, select randomly from remaining posts
      if (eligiblePostData.votes === 0) {
        // Random selection for posts with no votes from authors who haven't won
        const eligiblePosts = sortedPosts.filter(
          (p) => !winningAuthors.has(p.post.author),
        );
        if (eligiblePosts.length > 0) {
          const randomIndex = crypto.randomInt(0, eligiblePosts.length);
          const randomPostData = eligiblePosts[randomIndex];
          winners.push({
            place: reward.place,
            reward: reward.rewardInUSD,
            post: randomPostData.post,
            votePercentage: randomPostData.votePercentage,
          });
          winningAuthors.add(randomPostData.post.author);
        }
      } else {
        winners.push({
          place: reward.place,
          reward: reward.rewardInUSD,
          post: eligiblePostData.post,
          votePercentage: eligiblePostData.votePercentage,
        });
        winningAuthors.add(eligiblePostData.post.author);
      }
    }

    // Get all participants from posts
    const allParticipants = [...new Set(posts.map((post) => post.author))];

    // Add participants to giveaway participants collection
    if (allParticipants.length > 0) {
      await this.giveawayParticipantsRepository.insertMany(
        allParticipants.map((userName) => ({
          userName,
          activationPermlink: campaign.activationPermlink,
          eventId,
        })),
      );
    }

    // Create payables for winners
    for (const winner of winners) {
      await this.createReview.createContestPayables({
        campaign,
        userName: winner.post.author,
        post: winner.post,
        eventId,
        place: winner.place,
        rewardInUSD: winner.reward,
      });
    }

    await this.setNextRecurrentEvent(
      campaign.recurrenceRule,
      _id,
      campaign.recurrenceRule,
    );
    this.messageOnReview.contestWinMessage(_id, eventId, winners);
  }

  async listener(key: string): Promise<void> {
    const [, type, id] = key.split(':');
    switch (type) {
      case RECURRENT_TYPE.CONTEST_OBJECT:
        return this.startContest(id);
      default:
        return;
    }
  }
}
