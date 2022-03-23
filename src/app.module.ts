import { Module } from '@nestjs/common';

import { ApiModule } from './api/api.module';
import { PersistenceModule } from './persistance/presistance.module';
import { DomainModule } from './domain/domain.module';
import { DatabaseModule } from './database/database.module';
import { RedisClientModule } from './services/redis/redis.module';

@Module({
  imports: [
    RedisClientModule,
    DatabaseModule,
    PersistenceModule,
    DomainModule,
    ApiModule,
  ],
})
export class AppModule {}
