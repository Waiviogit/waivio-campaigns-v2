import { Module } from '@nestjs/common';
import { TestCreate } from './test.create';

import { TestRepositoryModule } from '../../persistance/test/test-repository.module';

@Module({
  imports: [TestRepositoryModule],
  providers: [TestCreate],
  exports: [TestCreate],
})
export class TestModule {}
