import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { setTimeout } from 'timers/promises';
import { REVIEW_PROVIDE } from '../../../common/constants';
import { CommentQueueInterface } from './interface/comment-queue.interface';

@Injectable()
export class CommentQueueProcessorService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CommentQueueProcessorService.name);
  private isRunning = false;

  constructor(
    @Inject(REVIEW_PROVIDE.COMMENT_QUEUE)
    private readonly commentQueue: CommentQueueInterface,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.startProcessing();
  }

  private async startProcessing(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.logger.log('Starting comment queue processor');

    // Start both main queue processing and delayed comments processing
    const mainQueuePromise = this.processMainQueue();
    const delayedCommentsPromise = this.processDelayedComments();

    // Wait for both processes
    await Promise.all([mainQueuePromise, delayedCommentsPromise]);
  }

  private async processMainQueue(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.commentQueue.processNextComment();

        // Add delay between comments to avoid rate limiting
        await setTimeout(5000);
      } catch (error) {
        this.logger.error(`Error processing main queue: ${error.message}`);

        // If Redis client is closed, wait longer and try to reconnect
        if (error.message.includes('client is closed')) {
          this.logger.warn('Redis client closed, waiting for reconnection...');
          await setTimeout(30000); // Wait 30 seconds for Redis to reconnect
        } else {
          // Wait longer on other errors to avoid hammering Redis
          await setTimeout(10000);
        }
      }
    }
  }

  private async processDelayedComments(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.commentQueue.processDelayedComments();

        // Check every 10 seconds for delayed comments
        await setTimeout(10000);
      } catch (error) {
        this.logger.error(
          `Error processing delayed comments: ${error.message}`,
        );

        // If Redis client is closed, wait longer and try to reconnect
        if (error.message.includes('client is closed')) {
          this.logger.warn('Redis client closed, waiting for reconnection...');
          await setTimeout(30000); // Wait 30 seconds for Redis to reconnect
        } else {
          // Wait longer on other errors to avoid hammering Redis
          await setTimeout(15000);
        }
      }
    }
  }

  async stopProcessing(): Promise<void> {
    this.isRunning = false;
    this.logger.log('Stopping comment queue processor');
  }
}
