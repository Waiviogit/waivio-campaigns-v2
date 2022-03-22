import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestRepoProvider } from './test-persistance.provider';
import { Test, TestSchema } from './test.schema';
import { CONNECTION_MONGO } from '../../common/constants';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Test.name, schema: TestSchema }],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [TestRepoProvider],
  exports: [TestRepoProvider],
})
export class TestRepositoryModule {}
