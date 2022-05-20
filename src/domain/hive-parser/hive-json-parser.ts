import { Injectable } from '@nestjs/common';
import { HiveCustomJsonType } from '../../common/types';
import { HiveJsonParserInterface } from './interface';

@Injectable()
export class HiveJsonParser implements HiveJsonParserInterface {
  async parse({ id, json }: HiveCustomJsonType): Promise<void> {
    console.log()
  }
}
