import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { configService } from '../../../common/config';
import {
  REDIS_PROVIDE,
  REDIS_KEY,
  HIVE_PROVIDE,
  CAMPAIGN_PROVIDE,
  SPONSORS_BOT_PROVIDE,
} from '../../../common/constants';
import { RedisClientInterface } from '../../../services/redis/clients/interface';
import { HiveClientInterface } from '../../../services/hive-api/interface';
import {
  AddToQueueInterface,
  CommentQueueInterface,
  CommentQueueItem,
} from './interface/comment-queue.interface';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import { SponsorsBotInterface } from '../../sponsors-bot/interface';

@Injectable()
export class CommentQueueService implements CommentQueueInterface {
  private readonly logger = new Logger(CommentQueueService.name);
  private readonly queueKey = `${REDIS_KEY.COMMENT_QUEUE}`;
  private readonly processingKey = `${REDIS_KEY.COMMENT_PROCESSING}`;
  private readonly failedKey = `${REDIS_KEY.COMMENT_FAILED}`;

  constructor(
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
    @Inject(HIVE_PROVIDE.CLIENT)
    private readonly hiveClient: HiveClientInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
  ) {}

  async addToQueue({
    commentData,
    activationPermlink,
    beneficiaryAccount,
  }: AddToQueueInterface): Promise<void> {
    const queueItem: CommentQueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      commentData,
      activationPermlink,
      beneficiaryAccount,
      retryCount: 0,
      maxRetries: 3,
      createdAt: Date.now(),
    };

    await this.campaignRedisClient.lpush(
      this.queueKey,
      JSON.stringify(queueItem),
    );
    this.logger.log(`Added comment to queue: ${queueItem.id}`);
  }

  private async processComment(queueItem: CommentQueueItem): Promise<void> {
    try {
      this.logger.log(
        `Processing comment: ${queueItem.id}, attempt: ${
          queueItem.retryCount + 1
        }`,
      );
      let success = false;

      if (queueItem.activationPermlink) {
        success = await this.hiveClient.createCommentWithOptions(
          {
            ...queueItem.commentData,
            key: configService.getMessagePostingKey(),
          },
          this.hiveClient.getOptionsWithBeneficiaries(
            queueItem.commentData.author,
            queueItem.commentData.permlink,
            [
              {
                account: queueItem.beneficiaryAccount,
                weight: 10000,
              },
            ],
          ),
        );
        if (success) {
          await this.sponsorsBot.createBeneficiaryUpvoteRecords({
            activationPermlink: queueItem.activationPermlink,
            author: queueItem.commentData.author,
            permlink: queueItem.commentData.permlink,
          });
        }
      } else {
        if (queueItem.beneficiaryAccount) {
          success = await this.hiveClient.createCommentWithOptions(
            {
              ...queueItem.commentData,
              key: configService.getMessagePostingKey(),
            },
            this.hiveClient.getOptionsWithBeneficiaries(
              queueItem.commentData.author,
              queueItem.commentData.permlink,
              [
                {
                  account: queueItem.beneficiaryAccount,
                  weight: 10000,
                },
              ],
            ),
          );
        } else {
          success = await this.hiveClient.createComment({
            ...queueItem.commentData,
            key: configService.getMessagePostingKey(),
          });
        }
      }

      if (success) {
        this.logger.log(`Comment posted successfully: ${queueItem.id}`);
        return;
      }

      // Comment failed, handle retry logic
      await this.handleFailedComment(queueItem);
    } catch (error) {
      this.logger.error(
        `Error posting comment ${queueItem.id}: ${error.message}`,
      );
      await this.handleFailedComment(queueItem);
    }
  }

  private async handleFailedComment(
    queueItem: CommentQueueItem,
  ): Promise<void> {
    queueItem.retryCount++;

    if (queueItem.retryCount >= queueItem.maxRetries) {
      // Max retries reached, move to failed queue
      await this.campaignRedisClient.lpush(
        this.failedKey,
        JSON.stringify(queueItem),
      );
      this.logger.error(
        `Comment failed permanently after ${queueItem.maxRetries} attempts: ${queueItem.id}`,
      );
      return;
    }

    // Add back to queue for retry with exponential backoff
    const backoffDelay = Math.min(
      5000 * Math.pow(2, queueItem.retryCount - 1),
      30000,
    ); // Max 30 seconds
    queueItem.createdAt = Date.now() + backoffDelay;

    // Use sorted set for delayed retry
    await this.campaignRedisClient.zadd(
      this.processingKey,
      queueItem.createdAt,
      JSON.stringify(queueItem),
    );

    this.logger.log(
      `Comment ${
        queueItem.id
      } scheduled for retry in ${backoffDelay}ms (attempt ${
        queueItem.retryCount + 1
      })`,
    );
  }

  async processDelayedComments(): Promise<void> {
    const now = Date.now();
    const readyComments = await this.campaignRedisClient.zremrangebyscore(
      this.processingKey,
      0,
      now,
    );

    if (readyComments > 0) {
      const comments = await this.campaignRedisClient.lrange(
        this.processingKey,
        0,
        -1,
      );

      for (const commentJson of comments) {
        try {
          await this.campaignRedisClient.zrem(this.processingKey, commentJson);
          await this.campaignRedisClient.lpush(this.queueKey, commentJson);
        } catch (error) {
          this.logger.error(
            `Error processing delayed comment: ${error.message}`,
          );
        }
      }
    }
  }

  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    failed: number;
  }> {
    const [pending, processing, failed] = await Promise.all([
      this.campaignRedisClient.llen(this.queueKey),
      this.campaignRedisClient.llen(this.processingKey),
      this.campaignRedisClient.llen(this.failedKey),
    ]);

    return {
      pending: pending || 0,
      processing: processing || 0,
      failed: failed || 0,
    };
  }

  async getFailedComments(): Promise<CommentQueueItem[]> {
    const failedComments = await this.campaignRedisClient.lrange(
      this.failedKey,
      0,
      -1,
    );
    return failedComments.map((comment) => JSON.parse(comment));
  }

  async retryFailedComment(commentId: string): Promise<void> {
    const failedComments = await this.getFailedComments();
    const comment = failedComments.find((c) => c.id === commentId);

    if (!comment) {
      throw new Error(`Failed comment not found: ${commentId}`);
    }

    // Remove from failed queue
    await this.campaignRedisClient.rpop(this.failedKey);

    // Reset retry count and add back to main queue
    comment.retryCount = 0;
    comment.createdAt = Date.now();

    await this.campaignRedisClient.lpush(
      this.queueKey,
      JSON.stringify(comment),
    );
    this.logger.log(`Retrying failed comment: ${commentId}`);
  }

  // Internal method to process comments from the queue
  async processNextComment(): Promise<void> {
    const queueItemJson = await this.campaignRedisClient.rpop(this.queueKey);

    if (!queueItemJson) {
      return; // No items in queue
    }

    const queueItem: CommentQueueItem = JSON.parse(queueItemJson);
    await this.processComment(queueItem);
  }
}
