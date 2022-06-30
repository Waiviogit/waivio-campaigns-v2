import { Provider } from '@nestjs/common';
import { BLACKLIST_PROVIDE } from '../../common/constants';
import { BlacklistRepository } from './blacklist.repository';

export const BlacklistPersistenceProvider: Provider = {
  provide: BLACKLIST_PROVIDE.REPOSITORY,
  useClass: BlacklistRepository,
};
