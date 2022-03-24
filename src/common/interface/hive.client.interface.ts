import { HiveBlock } from '../types/hive-block.type';

export interface HiveClient {
  getBlock(blockNumber: number): Promise<HiveBlock | undefined>;
}
