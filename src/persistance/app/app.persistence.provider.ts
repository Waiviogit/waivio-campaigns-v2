import { Provider } from '@nestjs/common';

import { APP_PROVIDE } from '../../common/constants';
import { AppRepository } from './app.repository';

export const AppPersistenceProvider: Provider = {
  provide: APP_PROVIDE.REPOSITORY,
  useClass: AppRepository,
};
