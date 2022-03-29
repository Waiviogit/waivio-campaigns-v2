import { Module } from '@nestjs/common';
import { TestCreate } from './test.create';

import { PersistenceModule } from '../../persistance/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [TestCreate],
  exports: [TestCreate],
})
export class TestModule {}
