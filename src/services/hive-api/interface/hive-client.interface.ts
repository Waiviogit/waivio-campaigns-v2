import { HiveBlockType } from '../../../common/types';

export interface HiveClientInterface {
  getBlock(blockNumber: number): Promise<HiveBlockType | undefined>;
}
