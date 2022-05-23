import { Provider } from '@nestjs/common';
import { HiveMainParser } from './hive-main-parser';
import { HIVE_PARSER_PROVIDE } from '../../common/constants';
import { HiveCommentParser } from './hive-comment-parser';
import { HiveTransferParser } from './hive-transfer-parser';
import { HiveJsonParser } from './hive-json-parser';
import { HiveAccUpdateParser } from './hive-acc-update-parser';

export const HiveMainParserProvider: Provider = {
  provide: HIVE_PARSER_PROVIDE.MAIN,
  useClass: HiveMainParser,
};

export const HiveCommentParserProvider: Provider = {
  provide: HIVE_PARSER_PROVIDE.COMMENT,
  useClass: HiveCommentParser,
};

export const HiveTransferParserProvider: Provider = {
  provide: HIVE_PARSER_PROVIDE.TRANSFER,
  useClass: HiveTransferParser,
};

export const HiveJsonParserProvider: Provider = {
  provide: HIVE_PARSER_PROVIDE.JSON,
  useClass: HiveJsonParser,
};

export const HiveAccUpdateParserProvider: Provider = {
  provide: HIVE_PARSER_PROVIDE.ACCOUNT_UPDATE,
  useClass: HiveAccUpdateParser,
};
