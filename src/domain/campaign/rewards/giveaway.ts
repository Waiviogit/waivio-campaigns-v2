import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
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
import { GiveawayRequirements } from '../../../persistance/campaign/types';
import {
  GiveawayInterface,
  ValidateGiveawayWinner,
} from '../interface/giveaway.interface';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import { CreateReviewInterface } from '../review/interface';
import { parseJSON } from '../../../common/helpers';
import { UserSubscriptionRepositoryInterface } from '../../../persistance/user-subscriptions/interface';

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
  ) {}

  private async searchFollowers(post: PostDocumentType): Promise<string[]> {
    return this.userSubscriptionRepository.findUserSubscriptions(post.author);
  }

  private async searchVotes(post: PostDocumentType): Promise<string[]> {
    return post.active_votes.map((v) => v.voter);
  }

  private async searchReblogs(post: PostDocumentType): Promise<string[]> {
    //`${post.author}/${post.author}`, in permlink is reblog
    const reblogs = await this.postRepository.find({
      filter: {
        permlink: `${post.author}/${post.author}`,
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

  private pickMethodToSearch(
    giveawayRequirements: GiveawayRequirements,
  ): (post: PostDocumentType) => Promise<string[]> {
    if (giveawayRequirements.follow) return this.searchFollowers;
    if (giveawayRequirements.likePost) return this.searchVotes;
    if (giveawayRequirements.reblog) return this.searchReblogs;
    return this.searchComments;
  }

  private async validateWinner({
    giveawayRequirements,
    userRequirements,
    winner,
    post,
  }: ValidateGiveawayWinner): Promise<boolean> {
    const user = await this.userRepository.findOne({
      filter: { name: winner },
    });
    if (!user) return false;

    const isValid = {
      followers:
        _.get(user, 'followers_count', 0) >=
        _.get(userRequirements, 'minFollowers', 0),
      posts:
        _.get(user, 'count_posts', 0) >= _.get(userRequirements, 'minPosts', 0),
      expertise:
        _.get(user, 'wobjects_weight', 0) >=
        _.get(userRequirements, 'minExpertise', 0),
      likePost: true,
      comment: true,
      tagInComment: true,
      reblog: true,
      follow: true,
    };

    if (giveawayRequirements.follow) {
      const followers = await this.searchFollowers(post);
      isValid.follow = followers.includes(winner);
    }

    if (giveawayRequirements.likePost) {
      const votes = await this.searchVotes(post);
      isValid.likePost = votes.includes(winner);
    }
    if (giveawayRequirements.comment) {
      const comments = await this.searchComments(post);
      isValid.comment = comments.includes(winner);
    }
    if (giveawayRequirements.tagInComment) {
      const state = await this.hiveClient.getState(post.author, post.permlink);
      const comments = Object.values(state.content);
      const comment = _.filter(comments, (el) => {
        const author =
          parseJSON(el.json_metadata)?.comment?.userId || el.author;
        return author === winner;
      })
        .map((el) => el.body || '')
        .join(' ');

      const mentions = (comment.match(/@([a-zA-Z0-9._-]+)/g) || []).map((m) =>
        m.slice(1),
      );
      //we need 2 hardcoded
      const mentioned = await this.userRepository.find({
        filter: { name: { $in: mentions } },
        projection: { name: 1 },
        options: { limit: 2 },
      });
      isValid.tagInComment = mentioned.length === 2;
    }
    if (giveawayRequirements.reblog) {
      const reblogs = await this.searchReblogs(post);
      isValid.reblog = reblogs.includes(winner);
    }

    return _.every(Object.values(isValid));
  }

  private selectRandomWinner(participants: string[]): string {
    if (participants.length === 0) return '';
    const randomIndex = randomInt(0, participants.length);
    return participants[randomIndex];
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

    const searchMethod = this.pickMethodToSearch(campaign.giveawayRequirements);

    let participants = _.uniq(
      (await searchMethod(giveawayPost)).filter(
        (p) => p !== campaign.guideName,
      ),
    );

    if (participants.length === 0) return;
    let budget = BigNumber(campaign.budget);

    while (budget.gte(campaign.reward) && participants.length) {
      const winner = this.selectRandomWinner(participants);
      participants = participants.filter((p) => p !== winner);
      const validWinner = await this.validateWinner({
        winner,
        post: giveawayPost,
        giveawayRequirements: campaign.giveawayRequirements,
        userRequirements: campaign.userRequirements,
      });

      if (!validWinner) continue;
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
  }
}
