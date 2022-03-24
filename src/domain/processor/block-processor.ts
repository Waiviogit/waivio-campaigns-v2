import { Inject, Injectable } from '@nestjs/common';

import { HIVE_PROVIDE, REDIS_KEY, REDIS_PROVIDE } from '../../common/constants';
import { TestRepository } from '../test/test-repository.interface';
import { HiveClient } from '../../services/hive-api/interface/hive.client.interface';
import { RedisClient } from '@nestjs/microservices/external/redis.interface';

@Injectable()
export class BlockProcessor {
  constructor(
    @Inject(REDIS_PROVIDE.BLOCK_CLIENT)
    private readonly redisBlockClient: RedisClient,
    @Inject('TestRepo') private readonly testRepository: TestRepository,
    @Inject(HIVE_PROVIDE.CLIENT) private readonly hiveClient: HiveClient,
  ) {}

  async start(): Promise<void> {
    await this.loadNextBlock();
  }

  async loadNextBlock(): Promise<void> {
    const blockNumber = await this.redisBlockClient.get(REDIS_KEY.LAST_BLOCK);
    const yo = await this.testRepository.create('yo');
    const block = await this.hiveClient.getBlock(+blockNumber);
    console.log();
    await setTimeout(async () => this.loadNextBlock(), 2000);
  }
}
