import { Injectable, Logger } from '@nestjs/common';
import { Client, PrivateKey } from '@hiveio/dhive';
import axios from 'axios';
import { CONDENSER_API, HIVE_RPC_NODES, BRIDGE } from '../../common/constants';
import { HiveBlockType } from '../../common/types';
import { GetVoteInterface, HiveClientInterface } from './interface';
import {
  ActiveVotesType,
  BroadcastCommentType,
  CommentStateType,
  HiveContentType,
  VoteOnPostType,
} from './type';
import { CommentOptionsOperation } from '@hiveio/dhive/lib/chain/operation';
import { BeneficiaryRoute } from '@hiveio/dhive/lib/chain/comment';

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

  async createComment({
    key,
    author,
    permlink,
    parent_author,
    parent_permlink,
    body,
    title,
    json_metadata,
  }: BroadcastCommentType): Promise<boolean> {
    try {
      await this.broadcastClient.broadcast.comment(
        {
          author,
          permlink,
          parent_author,
          parent_permlink,
          body,
          title,
          json_metadata,
        },
        PrivateKey.fromString(key),
      );
      return true;
    } catch (error) {
      this.logger.error(error.message);
      return false;
    }
  }

  async createCommentWithOptions(
    comment: BroadcastCommentType,
    options: CommentOptionsOperation[1],
  ): Promise<boolean> {
    try {
      await this.broadcastClient.broadcast.commentWithOptions(
        comment,
        options,
        PrivateKey.fromString(comment.key),
      );
      return true;
    } catch (error) {
      this.logger.error(error.message);
      return false;
    }
  }

  getOptionsWithBeneficiaries(
    author: string,
    permlink: string,
    beneficiaries: BeneficiaryRoute[],
  ): CommentOptionsOperation[1] {
    return {
      extensions: [[0, { beneficiaries }]],
      author,
      permlink,
      max_accepted_payout: '100000.000 HBD',
      percent_hbd: 0,
      allow_votes: true,
      allow_curation_rewards: true,
    };
  }

  async getContent(author: string, permlink: string): Promise<HiveContentType> {
    return this.hiveRequest(CONDENSER_API.GET_CONTENT, [author, permlink]);
  }

  async getState(author: string, permlink: string): Promise<CommentStateType> {
    const content = await this.hiveRequest(BRIDGE.GET_DISCUSSION, {
      author,
      permlink,
    });

    for (const contentKey in content) {
      if (content[contentKey]?.json_metadata) {
        content[contentKey].json_metadata = JSON.stringify(
          content[contentKey].json_metadata,
        );
      }
    }

    return { content };
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
