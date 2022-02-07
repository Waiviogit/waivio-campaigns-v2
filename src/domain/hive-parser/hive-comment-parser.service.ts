import { Injectable } from '@nestjs/common';
import { HiveCommentDto, HiveCommentOptionsDto } from './dto/in';
import _ from 'lodash';
import { parseJSON } from '../../common/helpers';

@Injectable()
export class HiveCommentParserService {
  constructor() {}

  async parse(
    commentData: HiveCommentDto,
    commentOptions: HiveCommentOptionsDto,
  ): Promise<void> {
    const beneficiaries = _.get(
      commentOptions,
      '[1].extensions[0][1].beneficiaries',
      null,
    );
    const metadata = parseJSON(commentData.json_metadata, {});
    const app = metadata?.app;
    const hasActions = metadata?.waivioRewards;
    //#TODO add set demo post handle
    //#TODO add parse review
    if (hasActions) await this.parseActions();
  }

  async parseActions(): Promise<void> {}
}
