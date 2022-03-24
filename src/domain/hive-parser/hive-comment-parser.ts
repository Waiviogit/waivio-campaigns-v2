import { Injectable } from '@nestjs/common';

import _ from 'lodash';
import { parseJSON } from '../../common/helpers';
import { HiveCommentOptionsType, HiveCommentType } from '../../common/types';
import { HiveOperationParser } from './hive-operation-parser';

@Injectable()
export class HiveCommentParser extends HiveOperationParser {
  constructor() {
    super();
  }

  async parse(
    comment: HiveCommentType,
    options: HiveCommentOptionsType,
  ): Promise<void> {
    const beneficiaries = _.get(
      options,
      '[1].extensions[0][1].beneficiaries',
      null,
    );
    const metadata = parseJSON(comment.json_metadata, {});
    const app = metadata?.app;
    const hasActions = metadata?.waivioRewards;
    //#TODO add set demo post handle
    //#TODO add parse review
    if (hasActions) await this.parseActions();
  }

  async parseActions(): Promise<void> {}
}
