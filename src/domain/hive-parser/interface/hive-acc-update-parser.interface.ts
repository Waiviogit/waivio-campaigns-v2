import { HiveAccountUpdateType } from '../../../common/types';

export interface HiveAccUpdateParserInterface {
  parse({ account, posting }: HiveAccountUpdateType): Promise<void>;
}
