import { Provider } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { USER_PROVIDE } from '../../common/constants';

export const UserPersistenceProvider: Provider = {
  provide: USER_PROVIDE.REPOSITORY,
  useClass: UserRepository,
};
