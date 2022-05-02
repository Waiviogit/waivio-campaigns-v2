import { HiveCommentParseType } from '../types';

export interface HiveCommentParserInterface {
  parse({ comment, options }: HiveCommentParseType): Promise<void>;
}
