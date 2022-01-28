import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { RabbitmqController } from './rabbitmq.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { configService } from '../../common/config';

@Module({
  providers: [RabbitmqService],
  controllers: [RabbitmqController],
  exports: [],
})
export class RabbitmqModule {}
