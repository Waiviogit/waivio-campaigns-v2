import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { BlockProcessor } from './block-processor';

@Injectable()
export class StartParser implements OnApplicationBootstrap {
  constructor(private readonly blockProcessor: BlockProcessor) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.blockProcessor.start();
  }
}
