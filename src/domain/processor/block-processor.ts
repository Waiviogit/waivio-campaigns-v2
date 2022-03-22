import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import { REDIS_CLIENT, REDIS_KEY } from '../../common/constants';

@Injectable()
export class BlockProcessor implements OnModuleInit {
  // constructor(private readonly redisService: RedisService) {}

  // private redisBlockClient = this.redisService.getClient(REDIS_CLIENT.BLOCK);
  async onModuleInit() {
    await this.loadNextBlock();
  }

  async loadNextBlock() {
    console.log('-----------yo');
    // const blockNumber = await this.redisBlockClient.get(REDIS_KEY.LAST_BLOCK);
    await setTimeout(async () => this.loadNextBlock(), 2000);
  }
}
