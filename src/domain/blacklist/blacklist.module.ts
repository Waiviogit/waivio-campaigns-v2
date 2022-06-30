import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../persistance/persistence.module';
import { BlacklistHelperProvider } from './blacklist.provider';

@Module({
  imports: [PersistenceModule],
  providers: [BlacklistHelperProvider],
  exports: [BlacklistHelperProvider],
})
export class BlacklistModule {}
