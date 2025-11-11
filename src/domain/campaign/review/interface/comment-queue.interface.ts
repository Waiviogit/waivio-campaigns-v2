import { BroadcastCommentType } from '../../../../services/hive-api/type';

export interface CommentQueueItem {
  id: string;
  commentData: Omit<BroadcastCommentType, 'key'>;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  activationPermlink?: string;
}

export interface CommentQueueInterface {
  addToQueue(
    commentData: Omit<BroadcastCommentType, 'key'>,
    activationPermlink?: string,
  ): Promise<void>;
  processNextComment(): Promise<void>;
  processDelayedComments(): Promise<void>;
  getQueueStats(): Promise<{
    pending: number;
    processing: number;
    failed: number;
  }>;
  getFailedComments(): Promise<CommentQueueItem[]>;
  retryFailedComment(commentId: string): Promise<void>;
}
