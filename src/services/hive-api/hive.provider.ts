import { Provider } from '@nestjs/common';
import { HiveClient } from './hive-client';
import { HIVE_PROVIDE } from '../../common/constants';

export const HiveClientProvider: Provider = {
  provide: HIVE_PROVIDE.CLIENT,
  useClass: HiveClient,
};
