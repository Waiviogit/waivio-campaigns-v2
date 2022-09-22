import { Injectable, Logger } from '@nestjs/common';
import { Client, PrivateKey } from '@hiveio/dhive';
import axios from 'axios';

import { CONDENSER_API, HIVE_RPC_NODES } from '../../common/constants';
import { HiveBlockType } from '../../common/types';
import { GetVoteInterface, HiveClientInterface } from './interface';
import {
  ActiveVotesType,
  CommentStateType,
  HiveContentType,
  VoteOnPostType,
} from './type';

@Injectable()
export class HiveClient implements HiveClientInterface {
  constructor() {}
  private readonly logger = new Logger(HiveClient.name);
  private readonly hiveNodes: string[] = HIVE_RPC_NODES;
  private url = this.hiveNodes[0];
  private broadcastClient = new Client(HIVE_RPC_NODES, {
    failoverThreshold: 0,
    timeout: 10 * 1000,
  });

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
    } catch (error) {
      this.logger.error(error.message);
      this.changeNode();
    }
  }

  async getBlock(blockNumber: number): Promise<HiveBlockType | undefined> {
    return this.hiveRequest(CONDENSER_API.GET_BLOCK, [blockNumber]);
  }

  async voteOnPost({
    key,
    voter,
    author,
    permlink,
    weight,
  }: VoteOnPostType): Promise<boolean> {
    try {
      await this.broadcastClient.broadcast.vote(
        {
          voter,
          author,
          permlink,
          weight,
        },
        PrivateKey.fromString(key),
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async getContent(author: string, permlink: string): Promise<HiveContentType> {
    return this.hiveRequest(CONDENSER_API.GET_CONTENT, [author, permlink]);
  }

  async getState(author: string, permlink: string): Promise<CommentStateType> {
    return this.hiveRequest(CONDENSER_API.GET_STATE, [
      `waivio/@${author}/${permlink}`,
    ]);
  }

  async getActiveVotes(
    author: string,
    permlink: string,
  ): Promise<ActiveVotesType[]> {
    return this.hiveRequest(CONDENSER_API.GET_ACTIVE_VOTES, [author, permlink]);
  }

  async getVote({
    author,
    voter,
    permlink,
  }: GetVoteInterface): Promise<ActiveVotesType> {
    const activeVotes = await this.getActiveVotes(author, permlink);
    return activeVotes.find((v) => v.voter === voter);
  }
}
