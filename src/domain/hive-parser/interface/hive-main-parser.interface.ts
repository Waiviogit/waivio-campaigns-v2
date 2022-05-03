import { HiveBlockType } from '../../../common/types';

export interface HiveMainParserInterface {
  parseBlock(block: HiveBlockType): Promise<void>;
}
