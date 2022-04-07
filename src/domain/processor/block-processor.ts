import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  HIVE_PARSER_PROVIDE,
  HIVE_PROVIDE,
  REDIS_KEY,
  REDIS_PROVIDE,
} from '../../common/constants';
import { DEFAULT_START_BLOCK_CAMPAIGN } from './constants';
import { RedisClientInterface } from '../../services/redis/clients/interface';
import { HiveClientInterface } from '../../services/hive-api/interface';
import { HiveMainParserInterface } from '../hive-parser/interface';

@Injectable()
export class BlockProcessor {
  private currentBlock: number;
  private readonly logger = new Logger(BlockProcessor.name);
  readonly redisBlockKey: string = REDIS_KEY.LAST_BLOCK_MAIN;
  readonly startDefaultBlock: number = DEFAULT_START_BLOCK_CAMPAIGN;

  constructor(
    @Inject(REDIS_PROVIDE.BLOCK_CLIENT)
    private readonly redisBlockClient: RedisClientInterface,
    @Inject(HIVE_PROVIDE.CLIENT)
    private readonly hiveClient: HiveClientInterface,
    @Inject(HIVE_PARSER_PROVIDE.MAIN)
    private readonly hiveParser: HiveMainParserInterface,
  ) {}

  async start(): Promise<void> {
    await this.loadNextBlock();
  }

  private async loadNextBlock(): Promise<void> {
    this.currentBlock = await this.getBlockNumber();
    process.env[`BLOCK_NUM_${BlockProcessor.name}`] = String(this.currentBlock);

    const start = process.hrtime();
    const processed = await this.processBlock(this.currentBlock);
    const end = process.hrtime(start);

    this.logger.log(`${this.currentBlock}: ${end[1] / 1000000}ms`);
    if (processed) {
      await this.redisBlockClient.set(
        this.redisBlockKey,
        `${this.currentBlock + 1}`,
      );
      await this.loadNextBlock();
    } else {
      await setTimeout(async () => this.loadNextBlock(), 2000);
    }
  }

  private async processBlock(blockNumber: number): Promise<boolean> {
    const block = await this.hiveClient.getBlock(blockNumber);
    if (block && (!block.transactions || !block.transactions[0])) {
      this.logger.log(`EMPTY BLOCK: ${blockNumber}`);
      return true;
    }
    if (block && block.transactions && block.transactions[0]) {
      await this.hiveParser.parseHiveBlock(block);
      return true;
    }
    return false;
  }

  private async getBlockNumber(): Promise<number> {
    const blockNumber = await this.redisBlockClient.get(this.redisBlockKey);
    if (blockNumber) return +blockNumber;
    return this.startDefaultBlock;
  }
}
