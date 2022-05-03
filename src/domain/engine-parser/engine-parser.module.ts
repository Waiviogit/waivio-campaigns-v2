import { Module } from '@nestjs/common';

import { EngineMainParserProvider } from './engine-parser.provider';

@Module({
  providers: [EngineMainParserProvider],
  exports: [EngineMainParserProvider],
})
export class EngineParserModule {}
