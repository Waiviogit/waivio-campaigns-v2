import { HiveBlockType } from '../../../common/types';

export interface HiveMainParserInterface {
  parseHiveBlock(block: HiveBlockType): Promise<void>;
}
