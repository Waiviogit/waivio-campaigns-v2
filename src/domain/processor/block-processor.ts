import { Inject, Injectable } from '@nestjs/common';

import { REDIS_KEY } from '../../common/constants';
import { RedisBlockClient } from '../../services/redis/block-client';
import { TestRepository } from '../test/test-repository.interface';

const TestRepo = () => Inject('TestRepo');

@Injectable()
export class BlockProcessor {
  constructor(
    private readonly redisBlockClient: RedisBlockClient,
    @TestRepo() private readonly testRepository: TestRepository,
  ) {}

  async start(): Promise<void> {
    await this.loadNextBlock();
  }

  async loadNextBlock(): Promise<void> {

    const blockNumber = await this.redisBlockClient.get(REDIS_KEY.LAST_BLOCK);
    const yo = await this.testRepository.create('yo');
    console.log();
    await setTimeout(async () => this.loadNextBlock(), 2000);
  }
}
