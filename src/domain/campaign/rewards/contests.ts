import * as _ from 'lodash';
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
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import { ContestsInterface } from './interface';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import { CreateReviewInterface } from '../review/interface';
import { parseJSON } from '../../../common/helpers';
import { UserSubscriptionRepositoryInterface } from '../../../persistance/user-subscriptions/interface';
import { GiveawayParticipantsRepositoryInterface } from '../../../persistance/giveaway-participants/interface';
import { MessageOnReviewInterface } from '../review/interface/message-on-review.interface';
import { ContestWinnerType } from '../review/types';
import * as crypto from 'node:crypto';

@Injectable()
export class Contests implements ContestsInterface {
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

  private async getParticipants(
    campaign: CampaignDocumentType,
    post: PostDocumentType,
  ): Promise<{
    participants: string[];
    commentData: Map<
      string,
      {
        author: string;
        permlink: string;
        title: string;
        root_author: string;
        json_metadata: string;
      }
    >;
  }> {
    // Get all comments from the contest post
    const state = await this.hiveClient.getState(
      campaign.guideName,
      campaign.giveawayPermlink,
    );
    const comments = Object.values(state.content);

    // Extract all comment authors
    const commentAuthors = comments.map(
      (comment) =>
        parseJSON(comment.json_metadata)?.comment?.userId || comment.author,
    );

    // Filter out the guide and blacklisted users
    const usersToFilter = [
      ...(campaign.blacklistUsers || []),
      'spaminator',
      'letusbuyhive',
      campaign.guideName,
    ];

    const potentialParticipants = commentAuthors.filter(
      (author) => !usersToFilter.includes(author),
    );

    // Get unique participants
    const uniqueParticipants = _.uniq(potentialParticipants);

    // Validate participants against user requirements
    const filteredWithUserRequirements = await this.userRepository.find({
      filter: {
        name: { $in: uniqueParticipants },
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

    const participantNames = filteredWithUserRequirements.map((u) => u.name);

    // Validate giveaway requirements
    const validatedParticipants = [];
    const giveawayRequirements = campaign.giveawayRequirements;

    for (const participant of participantNames) {
      let isValid = true;

      // Check follow requirement
      if (giveawayRequirements?.follow) {
        const followers =
          await this.userSubscriptionRepository.findUserSubscriptions(
            post.author,
          );
        if (!followers.includes(participant)) {
          isValid = false;
        }
      }

      // Check like post requirement
      if (giveawayRequirements?.likePost && isValid) {
        const hasLiked = post.active_votes?.some(
          (vote) => vote.voter === participant && vote.percent > 0,
        );
        if (!hasLiked) {
          isValid = false;
        }
      }

      // Check reblog requirement
      if (giveawayRequirements?.reblog && isValid) {
        const reblogs = await this.postRepository.find({
          filter: {
            permlink: `${post.author}/${post.permlink}`,
            author: participant,
          },
          projection: {
            author: 1,
          },
        });
        if (reblogs.length === 0) {
          isValid = false;
        }
      }

      // Check tag in comment requirement
      if (giveawayRequirements?.tagInComment && isValid) {
        const participantComments = comments.filter((comment) => {
          const commentAuthor =
            parseJSON(comment.json_metadata)?.comment?.userId || comment.author;
          return commentAuthor === participant;
        });

        let hasMentions = false;
        for (const comment of participantComments) {
          const mentions = (
            comment.body?.match(/@([a-zA-Z0-9._-]+)/g) || []
          ).map((m) => m.slice(1));

          if (mentions.length >= 2) {
            const mentioned = await this.userRepository.find({
              filter: { name: { $in: mentions } },
              projection: { name: 1 },
              options: { limit: 2 },
            });

            if (mentioned.length >= 2) {
              hasMentions = true;
              break;
            }
          }
        }

        if (!hasMentions) {
          isValid = false;
        }
      }

      if (isValid) {
        validatedParticipants.push(participant);
      }
    }

    // Get comment data for valid participants
    const commentData = new Map();
    for (const comment of comments) {
      const commentAuthor =
        parseJSON(comment.json_metadata)?.comment?.userId || comment.author;

      if (validatedParticipants.includes(commentAuthor)) {
        commentData.set(commentAuthor, {
          author: commentAuthor,
          permlink: comment.permlink,
          title: comment.title || '',
          root_author: comment.author,
          json_metadata: comment.json_metadata || '',
        });
      }
    }

    return { participants: validatedParticipants, commentData };
  }

  private async getJudgeVotes(
    campaign: CampaignDocumentType,
    participants: string[],
  ): Promise<Map<string, number>> {
    const votes = new Map<string, number>();

    // Initialize votes for all participants
    participants.forEach((participant) => {
      votes.set(participant, 0);
    });

    // Get judges (campaign creator is default judge)
    const judges = [campaign.guideName, ...(campaign.contestJudges || [])];

    // Get the contest post to analyze comments and votes
    const contestPost = await this.postRepository.findOne({
      filter: {
        author: campaign.guideName,
        permlink: campaign.giveawayPermlink,
      },
    });

    if (!contestPost) return votes;

    // Get all comments under the contest post
    const state = await this.hiveClient.getState(
      campaign.guideName,
      campaign.giveawayPermlink,
    );
    const comments = Object.values(state.content);

    // Calculate judge votes from comments
    for (const comment of comments) {
      const commentAuthor =
        parseJSON(comment.json_metadata)?.comment?.userId || comment.author;

      // Check if this comment is from a participant
      if (!participants.includes(commentAuthor)) continue;

      // Check if this comment has votes from judges
      if (comment.active_votes && Array.isArray(comment.active_votes)) {
        for (const vote of comment.active_votes) {
          if (judges.includes(vote.voter)) {
            // This is a judge voting on a participant's comment
            const currentVotes = votes.get(commentAuthor) || 0;
            votes.set(commentAuthor, currentVotes + (vote.percent || 0));
          }
        }
      }
    }

    return votes;
  }

  async runContest(_id: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        _id,
        type: CAMPAIGN_TYPE.CONTESTS,
        status: CAMPAIGN_STATUS.ACTIVE,
      },
    });
    if (!campaign) return;
    if (!campaign.giveawayPermlink) return;
    if (!campaign.giveawayRequirements) return;
    if (!campaign.contestRewards) return;

    const contestPost = await this.postRepository.findOne({
      filter: {
        author: campaign.guideName,
        permlink: campaign.giveawayPermlink,
      },
    });
    if (!contestPost) return;

    const { participants, commentData } = await this.getParticipants(
      campaign,
      contestPost,
    );
    if (participants.length === 0) return;

    await this.giveawayParticipantsRepository.insertMany(
      participants.map((p) => ({
        userName: p,
        activationPermlink: campaign.activationPermlink,
      })),
    );

    // Get judge votes
    const judgeVotes = await this.getJudgeVotes(campaign, participants);

    // Calculate vote percentages and sort participants by judge vote percentage
    const judges = [campaign.guideName, ...(campaign.contestJudges || [])];
    const totalJudges = judges.length;

    const participantsWithVotePercentage = participants.map((participant) => {
      const votes = judgeVotes.get(participant) || 0;
      const votePercentage = totalJudges > 0 ? (votes / totalJudges) * 100 : 0;

      return {
        participant,
        votes,
        votePercentage,
      };
    });

    // Sort by vote percentage (descending), then by votes (descending)
    const sortedParticipants = participantsWithVotePercentage.sort((a, b) => {
      if (a.votePercentage !== b.votePercentage) {
        return b.votePercentage - a.votePercentage;
      }
      return b.votes - a.votes;
    });

    // Determine winners based on contest rewards
    const winners: ContestWinnerType[] = [];
    const winningParticipants = new Set<string>();
    const contestRewards = campaign.contestRewards || [];

    for (
      let i = 0;
      i < Math.min(contestRewards.length, sortedParticipants.length);
      i++
    ) {
      const reward = contestRewards[i];

      // Find the next eligible participant (hasn't won yet)
      let eligibleParticipantData = null;
      for (const participantData of sortedParticipants) {
        if (!winningParticipants.has(participantData.participant)) {
          eligibleParticipantData = participantData;
          break;
        }
      }

      if (!eligibleParticipantData) {
        // No more eligible participants, break the loop
        break;
      }

      // If no votes or tied votes, select randomly from remaining participants
      if (eligibleParticipantData.votes === 0) {
        // Random selection for participants with no votes who haven't won
        const eligibleParticipants = sortedParticipants.filter(
          (p) => !winningParticipants.has(p.participant),
        );
        if (eligibleParticipants.length > 0) {
          const randomIndex = crypto.randomInt(0, eligibleParticipants.length);
          const randomParticipantData = eligibleParticipants[randomIndex];

          // Get the actual comment data for the winner
          const winnerCommentData = commentData.get(
            randomParticipantData.participant,
          );
          if (!winnerCommentData) continue;

          // Create a post object from comment data
          const post = {
            author: winnerCommentData.author,
            permlink: winnerCommentData.permlink,
            title: winnerCommentData.title,
            root_author: winnerCommentData.root_author,
            json_metadata: winnerCommentData.json_metadata,
          } as PostDocumentType;

          winners.push({
            place: reward.place,
            reward: reward.rewardInUSD,
            post,
            votePercentage: randomParticipantData.votePercentage,
          });
          winningParticipants.add(randomParticipantData.participant);
        }
      } else {
        // Get the actual comment data for the winner
        const winnerCommentData = commentData.get(
          eligibleParticipantData.participant,
        );
        if (!winnerCommentData) continue;

        // Create a post object from comment data
        const post = {
          author: winnerCommentData.author,
          permlink: winnerCommentData.permlink,
          title: winnerCommentData.title,
          root_author: winnerCommentData.root_author,
          json_metadata: winnerCommentData.json_metadata,
        } as PostDocumentType;

        winners.push({
          place: reward.place,
          reward: reward.rewardInUSD,
          post,
          votePercentage: eligibleParticipantData.votePercentage,
        });
        winningParticipants.add(eligibleParticipantData.participant);
      }
    }

    // Create payables for winners
    for (const winner of winners) {
      await this.createReview.createContestPayables({
        campaign,
        userName: winner.post.author,
        post: winner.post,
        eventId: crypto.randomUUID(),
        place: winner.place,
        rewardInUSD: winner.reward,
      });
    }

    await this.campaignRepository.updateOne({
      filter: { _id },
      update: { status: CAMPAIGN_STATUS.EXPIRED },
    });

    // Send contest results message
    await this.messageOnReview.contestMessage(campaign.activationPermlink);
  }
}
