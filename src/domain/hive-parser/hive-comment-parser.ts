import { Injectable } from '@nestjs/common';

import _ from 'lodash';
import { parseJSON } from '../../common/helpers';
import { HiveComment, HiveCommentOptions } from '../../common/types';

@Injectable()
export class HiveCommentParser {
  constructor() {}

  async parse(
    commentData: HiveComment,
    commentOptions: HiveCommentOptions,
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
