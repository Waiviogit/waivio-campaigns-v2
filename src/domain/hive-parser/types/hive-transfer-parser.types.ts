import { HiveTransferParser } from '../hive-transfer-parser';

export type HiveTransferType = {
  from: string;
  to: string;
  amount: string;
  memo: string;
};

export type HiveTransferParseType = {
  transfer: HiveTransferType;
  transactionId: string;
};
