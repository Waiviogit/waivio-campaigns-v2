import { EngineTransactionType } from '../../../services/hive-engine-api/types';

export interface EngineCommentsParserInterface {
  parse(comments: EngineTransactionType[]): Promise<void>;
}
