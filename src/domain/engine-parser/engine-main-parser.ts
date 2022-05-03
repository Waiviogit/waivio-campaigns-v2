import { Injectable } from '@nestjs/common';

import { EngineBlockType } from '../../services/hive-engine-api/types';
import { EngineMainParserInterface } from './interface';

@Injectable()
export class EngineMainParser implements EngineMainParserInterface {
  async parseBlock(block: EngineBlockType): Promise<void> {
    console.log();
  }
}
