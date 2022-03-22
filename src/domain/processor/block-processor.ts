import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import { REDIS_CLIENT, REDIS_KEY } from '../../common/constants';
import { BlockClient } from '../../services/redis/block-client';

@Injectable()
export class BlockProcessor implements OnModuleInit {
  constructor(private readonly redisBlock: BlockClient) {}

  // private redisBlockClient = this.redisService.getClient(REDIS_CLIENT.BLOCK);
  async onModuleInit() {
    await this.loadNextBlock();
  }

  async loadNextBlock() {
    console.log('-----------yo');
    const blockNumber = await this.redisBlock.get(REDIS_KEY.LAST_BLOCK);
    await setTimeout(async () => this.loadNextBlock(), 2000);
  }
}
