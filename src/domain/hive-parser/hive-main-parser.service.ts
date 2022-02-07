import { Injectable } from '@nestjs/common';
import {
  HiveCommentDto,
  HiveVoteDto,
  HiveTransferDto,
  HiveCustomJsonDto,
  HiveAccountUpdateDto,
  HiveCommentOptionsDto,
} from './dto/in';
import { HiveCommentParserService } from './hive-comment-parser.service';

@Injectable()
export class HiveMainParserService {
  private _votes = [];
  constructor(private hiveCommentParserService: HiveCommentParserService) {}

  async vote(voteData: HiveVoteDto): Promise<void> {
    this._votes.push(voteData);
  }

  async processVotes(): Promise<void> {
    this._votes = [];
  }

  async comment(
    commentData: HiveCommentDto,
    commentOptions: HiveCommentOptionsDto,
  ): Promise<void> {
    await this.hiveCommentParserService.parse(commentData, commentOptions);
  }

  async transfer(transferData: HiveTransferDto): Promise<void> {}

  async custom_json(customData: HiveCustomJsonDto): Promise<void> {}

  async account_update(
    accountUpdateData: HiveAccountUpdateDto,
  ): Promise<void> {}

  async default(): Promise<void> {}
}
