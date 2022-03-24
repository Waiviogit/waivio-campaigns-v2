import { HiveBlock } from '../types';

export interface HiveMainParser {
  parseHiveBlock(block: HiveBlock): Promise<void>;
}
