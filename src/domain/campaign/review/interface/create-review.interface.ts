import { ParseReviewType } from '../types';
import { RestoreCustomType } from '../../../../common/types';

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
