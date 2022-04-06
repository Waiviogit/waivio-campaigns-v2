import { Provider } from '@nestjs/common';

import { WOBJECT_PROVIDE } from '../../common/constants';
import { WobjectHelper } from './wobject-helper';

export const WobjectHelperProvider: Provider = {
  provide: WOBJECT_PROVIDE.HELPER,
  useClass: WobjectHelper,
};
