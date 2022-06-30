import { Provider } from '@nestjs/common';
import { BLACKLIST_PROVIDE } from '../../common/constants';
import { BlacklistHelper } from './blacklist-helper';

export const BlacklistHelperProvider: Provider = {
  provide: BLACKLIST_PROVIDE.HELPER,
  useClass: BlacklistHelper,
};
