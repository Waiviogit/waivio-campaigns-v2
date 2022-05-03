import { EngineBlockType } from '../../../services/hive-engine-api/types';

export interface EngineMainParserInterface {
  parseBlock(block: EngineBlockType): Promise<void>;
}
