import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BlockClient } from './block-client';

@Injectable()
export class RedisConnect implements OnApplicationBootstrap {
  constructor(private readonly blockClient: BlockClient) {}

  async onApplicationBootstrap() {
    await this.blockClient.connect();
  }
}
