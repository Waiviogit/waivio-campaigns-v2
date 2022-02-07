export class HiveBlockDto {
  previous: string;
  timestamp: string;
  witness: string;
  transaction_merkle_root: string;
  extensions: [];
  witness_signature: string;
  block_id: string;
  transactions: HiveTransactionDto[];
  transaction_ids: string[];
}

export class HiveTransactionDto {
  ref_block_num: number;
  ref_block_prefix: number;
  expiration: string;
  operations: [string, object][];
  extensions: [];
  signatures: string[];
  transaction_id: string;
  block_num: number;
  transaction_num: number;
}
