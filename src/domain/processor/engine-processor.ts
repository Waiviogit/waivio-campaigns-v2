import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ENGINE_PARSER_PROVIDE,
  HIVE_ENGINE_PROVIDE,
  REDIS_KEY,
  REDIS_PROVIDE,
} from '../../common/constants';
import { RedisClientInterface } from '../../services/redis/clients/interface';
import { DEFAULT_START_ENGINE_CAMPAIGN } from './constants';
import { HiveEngineClientInterface } from '../../services/hive-engine-api/interface';
import { EngineMainParserInterface } from '../engine-parser/interface';
import { AbstractProcessor } from './abstract-processor';

@Injectable()
export class EngineProcessor extends AbstractProcessor {
  constructor(
    @Inject(REDIS_PROVIDE.BLOCK_CLIENT)
    redisBlockClient: RedisClientInterface,
    @Inject(HIVE_ENGINE_PROVIDE.CLIENT)
    hiveClient: HiveEngineClientInterface,
    @Inject(ENGINE_PARSER_PROVIDE.MAIN)
    hiveParser: EngineMainParserInterface,
  ) {
    super(redisBlockClient, hiveClient, hiveParser);
    this.redisBlockKey = REDIS_KEY.LAST_BLOCK_ENGINE;
    this.startDefaultBlock = DEFAULT_START_ENGINE_CAMPAIGN;
    this.logger = new Logger(EngineProcessor.name);
  }
}
