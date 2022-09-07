import { ParseReviewType } from '../types';

export interface CreateReviewInterface {
  parseReview({
    metadata,
    beneficiaries,
    comment,
    app,
  }: ParseReviewType): Promise<void>;
  restoreReview(params: RestoreReviewInterface): Promise<void>;
}

export interface RestoreReviewInterface {
  user: string;
  //reservation
  parentPermlink: string;
  guideName: string;
}
