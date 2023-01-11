import { Provider } from '@nestjs/common';
import { MUTED_USER_PROVIDE } from '../../common/constants';
import { MutedUserRepository } from './muted-user.repository';

export const MutedUserPersistenceProvider: Provider = {
  provide: MUTED_USER_PROVIDE.REPOSITORY,
  useClass: MutedUserRepository,
};
