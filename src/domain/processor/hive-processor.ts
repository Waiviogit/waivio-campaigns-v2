import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  HIVE_PARSER_PROVIDE,
  HIVE_PROVIDE,
  REDIS_PROVIDE,
} from '../../common/constants';
import { RedisClientInterface } from '../../services/redis/clients/interface';
import { HiveClientInterface } from '../../services/hive-api/interface';
import { HiveMainParserInterface } from '../hive-parser/interface';
import { AbstractProcessor } from './abstract-processor';

@Injectable()
export class HiveProcessor extends AbstractProcessor {
  constructor(
    @Inject(REDIS_PROVIDE.BLOCK_CLIENT)
    redisBlockClient: RedisClientInterface,
    @Inject(HIVE_PROVIDE.CLIENT)
    hiveClient: HiveClientInterface,
    @Inject(HIVE_PARSER_PROVIDE.MAIN)
    hiveParser: HiveMainParserInterface,
  ) {
    super(redisBlockClient, hiveClient, hiveParser);
    this.logger = new Logger(HiveProcessor.name);
  }
}
