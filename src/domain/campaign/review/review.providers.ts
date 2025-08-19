import { Provider } from '@nestjs/common';
import { CreateReview } from './create-review';
import { REVIEW_PROVIDE } from '../../../common/constants';
import { FraudDetection } from './fraud-detection';
import { MessageOnReview } from './message-on-review';
import { CommentQueueService } from './comment-queue.service';
import { CommentQueueProcessorService } from './comment-queue-processor.service';

export const CreateReviewProvider: Provider = {
  provide: REVIEW_PROVIDE.CREATE,
  useClass: CreateReview,
};

export const FraudDetectionProvider: Provider = {
  provide: REVIEW_PROVIDE.FRAUD,
  useClass: FraudDetection,
};

export const MessageOnReviewProvider: Provider = {
  provide: REVIEW_PROVIDE.MESSAGE_ON_REVIEW,
  useClass: MessageOnReview,
};

export const CommentQueueServiceProvider: Provider = {
  provide: REVIEW_PROVIDE.COMMENT_QUEUE,
  useClass: CommentQueueService,
};

export const CommentQueueProcessorServiceProvider: Provider = {
  provide: 'CommentQueueProcessorService',
  useClass: CommentQueueProcessorService,
};
