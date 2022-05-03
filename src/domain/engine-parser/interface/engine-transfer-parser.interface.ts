import { EngineTransferParserType } from '../types/engine-transfer-parser.types';

export interface EngineTransferParserInterface {
  parse({ transfer, transactionId }: EngineTransferParserType): Promise<void>;
}
