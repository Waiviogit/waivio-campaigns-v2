import { Logger } from '@nestjs/common';
import { REDIS_KEY } from '../../common/constants';
import { DEFAULT_START_BLOCK_CAMPAIGN } from './constants';
import { RedisClientInterface } from '../../services/redis/clients/interface';
import { HiveClientInterface } from '../../services/hive-api/interface';
import { HiveMainParserInterface } from '../hive-parser/interface';
import { HiveEngineClientInterface } from '../../services/hive-engine-api/interface';
import { EngineMainParserInterface } from '../engine-parser/interface';
import { HiveBlockType } from '../../common/types';
import { EngineBlockType } from '../../services/hive-engine-api/types';
import { AbstractProcessorInterface } from './interface';

export abstract class AbstractProcessor implements AbstractProcessorInterface {
  private currentBlock: number;
  logger = new Logger(AbstractProcessor.name);
  redisBlockKey: string = REDIS_KEY.LAST_BLOCK_MAIN;
  startDefaultBlock: number = DEFAULT_START_BLOCK_CAMPAIGN;

  redisBlockClient: RedisClientInterface;
  hiveClient: HiveClientInterface | HiveEngineClientInterface;
  hiveParser: HiveMainParserInterface | EngineMainParserInterface;

  protected constructor(
    redisBlockClient: RedisClientInterface,
    hiveClient: HiveClientInterface | HiveEngineClientInterface,
    hiveParser: HiveMainParserInterface | EngineMainParserInterface,
  ) {
    this.redisBlockClient = redisBlockClient;
    this.hiveClient = hiveClient;
    this.hiveParser = hiveParser;
  }

  async start(): Promise<void> {
    await this.loadNextBlock();
  }

  private async loadNextBlock(): Promise<void> {
    this.currentBlock = await this.getBlockNumber();

    const start = process.hrtime();
    const processed = await this.processBlock(this.currentBlock);
    const end = process.hrtime(start);

    if (processed) {
      this.logger.log(`${this.currentBlock}: ${end[1] / 1000000}ms`);
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
      await this.hiveParser.parseBlock(
        block as HiveBlockType & EngineBlockType,
      );
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
