import { Provider } from '@nestjs/common';
import { CreateReview } from './create-review';
import { REVIEW_PROVIDE } from '../../../common/constants';
import { FraudDetection } from './fraud-detection';

export const CreateReviewProvider: Provider = {
  provide: REVIEW_PROVIDE.CREATE,
  useClass: CreateReview,
};

export const FraudDetectionProvider: Provider = {
  provide: REVIEW_PROVIDE.FRAUD,
  useClass: FraudDetection,
};
