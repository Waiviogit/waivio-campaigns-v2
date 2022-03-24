import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { CONDENSER_API, HIVE_RPC_NODES } from '../../common/constants';
import { HiveBlockType } from '../../common/types';
import { HiveClientInterface } from './interface';

@Injectable()
export class HiveClient implements HiveClientInterface {
  constructor() {}
  private readonly logger = new Logger(HiveClient.name);
  private readonly hiveNodes: string[] = HIVE_RPC_NODES;
  private url = this.hiveNodes[0];

  private changeNode(): void {
    const index = this.hiveNodes.indexOf(this.url);
    this.url =
      this.hiveNodes.length - 1 === index
        ? this.hiveNodes[0]
        : this.hiveNodes[index + 1];
    this.logger.error(`Node URL was changed to ${this.url}`);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async hiveRequest(method: string, params: unknown) {
    try {
      const resp = await axios.post(
        this.url,
        { jsonrpc: '2.0', method, params, id: 1 },
        { timeout: 8000 },
      );
      if (resp?.data?.error) {
        this.changeNode();
      }
      return resp?.data?.result;
    } catch (err) {
      this.logger.error(err.message);
      this.changeNode();
    }
  }

  async getBlock(blockNumber: number): Promise<HiveBlockType | undefined> {
    return this.hiveRequest(CONDENSER_API.GET_BLOCK, [blockNumber]);
  }
}
