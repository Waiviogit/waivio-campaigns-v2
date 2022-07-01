import { Provider } from '@nestjs/common';
import { BLACKLIST_PROVIDE } from '../../common/constants';
import { BlacklistHelper } from './blacklist-helper';
import { BlacklistParser } from './blacklist-parser';

export const BlacklistHelperProvider: Provider = {
  provide: BLACKLIST_PROVIDE.HELPER,
  useClass: BlacklistHelper,
};

export const BlacklistParserProvider: Provider = {
  provide: BLACKLIST_PROVIDE.PARSER,
  useClass: BlacklistParser,
};
