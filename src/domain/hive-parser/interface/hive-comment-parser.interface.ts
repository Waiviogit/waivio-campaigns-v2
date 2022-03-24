import { HiveComment, HiveCommentOptions } from '../../../common/types';

export interface HiveCommentParser {
  parse(
    commentData: HiveComment,
    commentOptions: HiveCommentOptions,
  ): Promise<void>;
}
