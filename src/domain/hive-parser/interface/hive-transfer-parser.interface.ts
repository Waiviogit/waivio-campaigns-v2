import { HiveTransferParseType } from '../types';

export interface HiveTransferParserInterface {
  parse({ transfer, transactionId }: HiveTransferParseType): Promise<void>;
}
