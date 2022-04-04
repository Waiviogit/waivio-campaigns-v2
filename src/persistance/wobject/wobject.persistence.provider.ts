import { Provider } from '@nestjs/common';

import { WOBJECT_PROVIDE } from '../../common/constants';
import { WobjectRepository } from './wobject.repository';

export const WobjectPersistenceProvider: Provider = {
  provide: WOBJECT_PROVIDE.REPOSITORY,
  useClass: WobjectRepository,
};
