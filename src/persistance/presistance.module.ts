import { Module } from '@nestjs/common';

import { TestRepositoryModule } from './test/test-repository.module';

@Module({
  imports: [TestRepositoryModule],
  exports: [TestRepositoryModule],
})
export class PersistenceModule {}
