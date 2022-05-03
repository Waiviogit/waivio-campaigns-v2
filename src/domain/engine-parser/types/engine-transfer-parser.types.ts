import { TransferPayloadType } from './engine-main-parser.types';

export type EngineTransferParserType = {
  transfer: TransferPayloadType & { sender: string };
  transactionId: string;
};
