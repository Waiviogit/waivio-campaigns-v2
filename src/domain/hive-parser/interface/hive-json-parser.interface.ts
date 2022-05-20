import { HiveCustomJsonType } from '../../../common/types';

export interface HiveJsonParserInterface {
  parse(customJson: HiveCustomJsonType): Promise<void>;
}
