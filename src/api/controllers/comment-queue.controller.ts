import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REVIEW_PROVIDE } from '../../common/constants';
import {
  CommentQueueInterface,
  CommentQueueItem,
} from '../../domain/campaign/review/interface/comment-queue.interface';
import { AuthGuard } from '../guards';

@Controller('comment-queue')
@UseGuards(AuthGuard)
export class CommentQueueController {
  constructor(
    @Inject(REVIEW_PROVIDE.COMMENT_QUEUE)
    private readonly commentQueue: CommentQueueInterface,
  ) {}

  @Get('stats')
  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    failed: number;
  }> {
    return await this.commentQueue.getQueueStats();
  }

  @Get('failed')
  async getFailedComments(): Promise<CommentQueueItem[]> {
    return await this.commentQueue.getFailedComments();
  }

  @Post('retry/:commentId')
  async retryFailedComment(@Param('commentId') commentId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    await this.commentQueue.retryFailedComment(commentId);
    return {
      success: true,
      message: `Comment ${commentId} added back to queue for retry`,
    };
  }
}
