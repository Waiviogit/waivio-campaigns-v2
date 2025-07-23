import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import { Inject, Injectable } from '@nestjs/common';

import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  GIVEAWAY_PARTICIPANTS_PROVIDE,
  HIVE_PROVIDE,
  POST_PROVIDE,
  REVIEW_PROVIDE,
  USER_PROVIDE,
  USER_SUBSCRIPTION_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import { PostRepositoryInterface } from '../../../persistance/post/interface';
import { PostDocumentType } from '../../../persistance/post/types';
import { HiveClientInterface } from '../../../services/hive-api/interface';
import {
  CampaignDocumentType,
  GiveawayRequirements,
} from '../../../persistance/campaign/types';
import { GiveawayInterface } from '../interface/giveaway.interface';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import { CreateReviewInterface } from '../review/interface';
import { parseJSON } from '../../../common/helpers';
import { UserSubscriptionRepositoryInterface } from '../../../persistance/user-subscriptions/interface';
import { GiveawayParticipantsRepositoryInterface } from '../../../persistance/giveaway-participants/interface';
import { MessageOnReviewInterface } from '../review/interface/message-on-review.interface';
import { selectRandomWinner } from '../../../common/helpers/randomHelper';

type SearchParticipantsType = (post: PostDocumentType) => Promise<string[]>;

@Injectable()
export class Giveaway implements GiveawayInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(POST_PROVIDE.REPOSITORY)
    private readonly postRepository: PostRepositoryInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(HIVE_PROVIDE.CLIENT)
    private readonly hiveClient: HiveClientInterface,
    @Inject(REVIEW_PROVIDE.CREATE)
    private readonly createReview: CreateReviewInterface,
    @Inject(USER_SUBSCRIPTION_PROVIDE.REPOSITORY)
    private readonly userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @Inject(GIVEAWAY_PARTICIPANTS_PROVIDE.REPOSITORY)
    private readonly giveawayParticipantsRepository: GiveawayParticipantsRepositoryInterface,
    @Inject(REVIEW_PROVIDE.MESSAGE_ON_REVIEW)
    private readonly messageOnReview: MessageOnReviewInterface,
  ) {}

  private async searchFollowers(post: PostDocumentType): Promise<string[]> {
    return this.userSubscriptionRepository.findUserSubscriptions(post.author);
  }

  private async searchVotes(post: PostDocumentType): Promise<string[]> {
    return post.active_votes.filter((v) => v.percent > 0).map((v) => v.voter);
  }

  private async searchReblogs(post: PostDocumentType): Promise<string[]> {
    //`${post.author}/${post.author}`, in permlink is reblog
    const reblogs = await this.postRepository.find({
      filter: {
        permlink: `${post.author}/${post.permlink}`,
      },
      projection: {
        author: 1,
      },
    });
    return reblogs.map((r) => r.author);
  }

  private async searchComments(post: PostDocumentType): Promise<string[]> {
    const state = await this.hiveClient.getState(post.author, post.permlink);
    const comments = Object.values(state.content);

    return comments.map((r) => {
      return parseJSON(r.json_metadata)?.comment?.userId || r.author;
    });
  }

  private async searchCommentsMentioned(
    post: PostDocumentType,
  ): Promise<string[]> {
    const state = await this.hiveClient.getState(post.author, post.permlink);
    const comments = Object.values(state.content);

    const participants = [];
    const checked = [];

    for (const comment of comments) {
      const author =
        parseJSON(comment.json_metadata)?.comment?.userId || comment.author;
      if (checked.includes(author)) continue;

      const authorComments = _.filter(comments, (el) => {
        const author =
          parseJSON(el.json_metadata)?.comment?.userId || el.author;
        return author === comment.author;
      })
        .map((el) => el.body || '')
        .join(' ');

      const mentions = (authorComments.match(/@([a-zA-Z0-9._-]+)/g) || []).map(
        (m) => m.slice(1),
      );
      //we need 2 hardcoded
      const mentioned = await this.userRepository.find({
        filter: { name: { $in: mentions } },
        projection: { name: 1 },
        options: { limit: 2 },
      });
      const isValid = mentioned.length === 2;

      if (isValid) participants.push(author);
      checked.push(author);
    }

    return participants;
  }

  private pickMethodsToSearch(
    giveawayRequirements: GiveawayRequirements,
  ): SearchParticipantsType[] {
    const funcsToCall = [];
    if (giveawayRequirements.follow) {
      funcsToCall.push(this.searchFollowers.bind(this));
    }
    if (giveawayRequirements.likePost)
      funcsToCall.push(this.searchVotes.bind(this));
    if (giveawayRequirements.reblog)
      funcsToCall.push(this.searchReblogs.bind(this));
    if (giveawayRequirements.tagInComment) {
      funcsToCall.push(this.searchCommentsMentioned.bind(this));
    } else if (giveawayRequirements.comment) {
      funcsToCall.push(this.searchComments.bind(this));
    }
    return funcsToCall;
  }

  private async getParticipants(
    campaign: CampaignDocumentType,
    post: PostDocumentType,
  ): Promise<string[]> {
    const searchMethods = this.pickMethodsToSearch(
      campaign.giveawayRequirements,
    );

    const usersForGiveaway = await Promise.all(
      searchMethods.map((m) => m(post)),
    );
    const usersToFilter = [
      ...(campaign.blacklistUsers || []),
      'spaminator',
      'letusbuyhive',
    ];

    const participantGiveawayRequirenments = _.uniq(
      _.intersection(...usersForGiveaway).filter(
        (p) => p !== campaign.guideName && !usersToFilter.includes(p),
      ),
    );

    const filteredWithUserRequirements = await this.userRepository.find({
      filter: {
        name: { $in: participantGiveawayRequirenments },
        followers_count: {
          $gte: _.get(campaign, 'userRequirements.minFollowers', 0),
        },
        count_posts: {
          $gte: _.get(campaign, 'userRequirements.minPosts', 0),
        },
        wobjects_weight: {
          $gte: _.get(campaign, 'userRequirements.minExpertise', 0),
        },
      },
      projection: {
        name: 1,
      },
    });

    const participants = filteredWithUserRequirements.map((u) => u.name);

    return participants;
  }

  async runGiveaway(_id: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({ filter: { _id } });
    if (!campaign) return;
    if (campaign.type !== CAMPAIGN_TYPE.GIVEAWAYS) return;
    if (campaign.status !== CAMPAIGN_STATUS.ACTIVE) return;
    if (!campaign.giveawayPermlink) return;
    if (!campaign.giveawayRequirements) return;

    const giveawayPost = await this.postRepository.findOne({
      filter: {
        author: campaign.guideName,
        permlink: campaign.giveawayPermlink,
      },
    });
    if (!giveawayPost) return;
    console.log('giveawayPost fetched');
    let participants = await this.getParticipants(campaign, giveawayPost);
    if (participants.length === 0) return;
    console.log(`partisipants: ${participants.join(',')}`);

    await this.giveawayParticipantsRepository.insertMany(
      participants.map((p) => ({
        userName: p,
        activationPermlink: campaign.activationPermlink,
      })),
    );

    let budget = BigNumber(campaign.budget);

    while (budget.gte(campaign.reward) && participants.length) {
      const winner = selectRandomWinner(participants);
      console.log('winner', winner);
      participants = participants.filter((p) => p !== winner);
      await this.createReview.createGiveawayPayables({
        campaign,
        userName: winner,
        post: giveawayPost,
      });

      budget = budget.minus(campaign.reward);
    }

    await this.campaignRepository.updateOne({
      filter: { _id },
      update: { status: CAMPAIGN_STATUS.EXPIRED },
    });
    console.log('call send message');
    await this.messageOnReview.giveawayMessage(campaign.activationPermlink);
  }
}
