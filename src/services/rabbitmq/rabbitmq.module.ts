import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { RabbitmqController } from './rabbitmq.controller';
import { HiveParsers } from '../../domain/hive-parser';

@Module({
  providers: [RabbitmqService, ...HiveParsers],
  controllers: [RabbitmqController],
  exports: [],
})
export class RabbitmqModule {}
