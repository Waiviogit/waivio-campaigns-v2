import { HiveCommentType, HiveCommentOptionsType } from '../../../common/types';

export interface HiveCommentParserInterface {
  parse(
    comment: HiveCommentType,
    options: HiveCommentOptionsType,
  ): Promise<void>;
}
