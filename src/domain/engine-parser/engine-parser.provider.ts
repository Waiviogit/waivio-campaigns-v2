import { Provider } from '@nestjs/common';
import { ENGINE_PARSER_PROVIDE } from '../../common/constants';

import { EngineMainParser } from './engine-main-parser';

export const EngineMainParserProvider: Provider = {
  provide: ENGINE_PARSER_PROVIDE.MAIN,
  useClass: EngineMainParser,
};
