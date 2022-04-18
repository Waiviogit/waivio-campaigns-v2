import { Module } from '@nestjs/common';

import { ApiModule } from './api/api.module';
import { PersistenceModule } from './persistance/persistence.module';
import { DomainModule } from './domain/domain.module';
import { DatabaseModule } from './database/database.module';
import { RedisClientModule } from './services/redis/redis.module';
import { HiveClientModule } from './services/hive-api/hive.module';
import { EngineModule } from './services/hive-engine-api/engine.module';

@Module({
  imports: [
    RedisClientModule,
    DatabaseModule,
    PersistenceModule,
    HiveClientModule,
    EngineModule,
    DomainModule,
    ApiModule,
  ],
})
export class AppModule {}
