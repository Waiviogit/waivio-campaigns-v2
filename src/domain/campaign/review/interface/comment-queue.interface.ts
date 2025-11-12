import { BroadcastCommentType } from '../../../../services/hive-api/type';

export interface CommentQueueItem {
  id: string;
  commentData: Omit<BroadcastCommentType, 'key'>;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  activationPermlink?: string;
  beneficiaryAccount?: string;
}

export interface AddToQueueInterface {
  commentData: Omit<BroadcastCommentType, 'key'>;
  activationPermlink?: string;
  beneficiaryAccount?: string;
}

export interface CommentQueueInterface {
  addToQueue({
    commentData,
    activationPermlink,
    beneficiaryAccount,
  }: AddToQueueInterface): Promise<void>;
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
