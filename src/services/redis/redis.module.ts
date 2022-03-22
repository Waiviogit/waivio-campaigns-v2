import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { configService } from '../../common/config';

@Module({
  imports: [RedisModule.register([configService.getRedisBlocksConfig()])],
})
export class RedisDbModule {}
