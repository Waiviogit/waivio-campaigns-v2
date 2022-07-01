import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../persistance/persistence.module';
import {
  BlacklistHelperProvider,
  BlacklistParserProvider,
} from './blacklist.provider';

@Module({
  imports: [PersistenceModule],
  providers: [BlacklistHelperProvider, BlacklistParserProvider],
  exports: [BlacklistHelperProvider, BlacklistParserProvider],
})
export class BlacklistModule {}
