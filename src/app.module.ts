import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { PersistenceModule } from './persistance/presistance.module';
import { DomainModule } from './domain/domain.module';
import { DatabaseModule } from './database/database.module';
import { RedisDbModule } from './services/redis/redis.module';

@Module({
  imports: [
    // RedisDbModule,
    DatabaseModule,
    PersistenceModule,
    DomainModule,
    ApiModule,
  ],
})
export class AppModule {}
