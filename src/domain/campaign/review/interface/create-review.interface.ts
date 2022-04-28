import { ParseReviewType } from '../types';

export interface CreateReviewInterface {
  parseReview({
    metadata,
    beneficiaries,
    comment,
    app,
  }: ParseReviewType): Promise<void>;
}
