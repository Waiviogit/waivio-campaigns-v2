import { Injectable } from '@nestjs/common';
import { HiveBlockDto } from '../../common/dto/in/hive-block.dto';

@Injectable()
export class RabbitmqService {
  constructor() {}
  async parseHiveBlock(block: HiveBlockDto): Promise<void> {
    console.log('------------getAllSubscribers');
  }
}
