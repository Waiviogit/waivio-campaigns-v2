import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RabbitmqService } from './rabbitmq.service';
import { HiveBlockDto } from '../../common/dto/in/hive-block.dto';

@Controller()
export class RabbitmqController {
  constructor(private readonly rabbitService: RabbitmqService) {}

  @MessagePattern({ event: 'newBlock' })
  async parseBlock(@Payload() block: HiveBlockDto): Promise<void> {
    await this.rabbitService.parseHiveBlock(block);
  }
}
