import { Module } from '@nestjs/common';
import { WobjectHelperProvider } from './wobject-providers';
import { PersistenceModule } from '../../persistance/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [WobjectHelperProvider],
  exports: [WobjectHelperProvider],
})
export class WobjectModule {}
