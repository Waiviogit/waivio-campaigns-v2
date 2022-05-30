import { Provider } from '@nestjs/common';
import { ENGINE_PARSER_PROVIDE } from '../../common/constants';

import { EngineMainParser } from './engine-main-parser';
import { EngineTransferParser } from './engine-transfer-parser';
import {EngineCommentsParser} from "./engine-comments-parser";

export const EngineMainParserProvider: Provider = {
  provide: ENGINE_PARSER_PROVIDE.MAIN,
  useClass: EngineMainParser,
};

export const EngineTransferParserProvider: Provider = {
  provide: ENGINE_PARSER_PROVIDE.TRANSFER,
  useClass: EngineTransferParser,
};

export const EngineCommentsParserProvider: Provider = {
  provide: ENGINE_PARSER_PROVIDE.COMMENTS,
  useClass: EngineCommentsParser,
};
