import { Injectable } from '@nestjs/common';
import { HiveBlockDto } from '../../common/dto/in/hive-block.dto';
import { HiveMainParserService } from '../../domain/hive-parser/hive-main-parser.service';

@Injectable()
export class RabbitmqService {
  constructor(private hiveMainParserService: HiveMainParserService) {}

  async parseHiveBlock(block: HiveBlockDto): Promise<void> {
    const { transactions } = block;
    for (const transaction of transactions) {
      if (!transaction && !transaction.operations && !transaction.operations[0])
        continue;
      for (const operation of transaction.operations) {
        await (
          this.hiveMainParserService[operation[0]] ||
          this.hiveMainParserService.default
        )(operation[1], transaction.operations[1]);
      }
      await this.hiveMainParserService.processVotes();
    }
  }
}
