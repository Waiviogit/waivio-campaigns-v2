import { ParseReviewType } from '../types';
import { RestoreCustomType } from '../../../../common/types';
import { CampaignDocumentType } from '../../../../persistance/campaign/types';
import { PostDocumentType } from '../../../../persistance/post/types';

export interface CreateReviewInterface {
  parseReview({
    metadata,
    beneficiaries,
    comment,
    app,
  }: ParseReviewType): Promise<void>;
  restoreReview(params: RestoreReviewInterface): Promise<void>;
  raiseReward(params: RaiseRewardInterface): Promise<void>;
  reduceReward(params: ReduceRewardInterface): Promise<void>;
  parseRestoreFromCustomJson({
    id,
    parsedJson,
    required_auths,
    required_posting_auths,
    transaction_id,
  }: RestoreCustomType): Promise<void>;
  createGiveawayPayables({
    campaign,
    userName,
    post,
  }: CreateGiveawayPayables): Promise<void>;
  createContestPayables({
    campaign,
    userName,
    post,
    eventId,
    place,
    rewardInUSD,
  }: CreateContestPayables): Promise<void>;
}

export interface CreateGiveawayPayables {
  campaign: CampaignDocumentType;
  userName: string;
  post: PostDocumentType;
  eventId?: string;
}

export interface CreateContestPayables {
  campaign: CampaignDocumentType;
  userName: string;
  post: PostDocumentType;
  eventId: string;
  place: number;
  rewardInUSD: number;
}

export interface RestoreReviewInterface {
  user: string;
  //reservation
  parentPermlink: string;
  guideName: string;
}

export interface RaiseRewardInterface {
  activationPermlink: string;
  guideName: string;
  user: string;
  parentPermlink: string;
  permlink: string;
  riseAmount: number;
}

export interface ReduceRewardInterface {
  activationPermlink: string;
  user: string;
  parentPermlink: string;
  permlink: string;
  reduceAmount: number;
}

export interface getSelfOrGivenTypeInterface {
  account: string;
  guideName: string;
  type: string;
}
