import { Provider } from '@nestjs/common';
import { HiveMainParser } from './hive-main-parser';
import { HIVE_PARSER_PROVIDE } from '../../common/constants';
import { HiveCommentParser } from './hive-comment-parser';

export const HiveMainParserProvider: Provider = {
  provide: HIVE_PARSER_PROVIDE.MAIN,
  useClass: HiveMainParser,
};

export const HiveCommentParserProvider: Provider = {
  provide: HIVE_PARSER_PROVIDE.COMMENT,
  useClass: HiveCommentParser,
};
