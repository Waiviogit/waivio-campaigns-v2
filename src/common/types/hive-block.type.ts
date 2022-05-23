export type HiveBlockType = {
  previous: string;
  timestamp: string;
  witness: string;
  transaction_merkle_root: string;
  extensions: [];
  witness_signature: string;
  block_id: string;
  transactions: HiveTransactionType[];
  transaction_ids: string[];
};

export type HiveTransactionType = {
  ref_block_num: number;
  ref_block_prefix: number;
  expiration: string;
  operations: [string, object][];
  extensions: [];
  signatures: string[];
  transaction_id: string;
  block_num: number;
  transaction_num: number;
};

export type HiveCommentType = {
  parent_author: string;
  parent_permlink: string;
  author: string;
  permlink: string;
  title: string;
  body: string;
  json_metadata: string;
};

export type HiveCommentOptionsType = {
  author: string;
  permlink: string;
  max_accepted_payout: MaxAcceptedPayoutType;
  percent_hbd: number;
  allow_votes: boolean;
  allow_curation_rewards: boolean;
  extensions: [number, { beneficiaries: BeneficiariesType[] }][];
};

export type MaxAcceptedPayoutType = {
  amount: string;
  precision: number;
  nai: string;
};

export type BeneficiariesType = {
  account: string;
  weight: number;
};

export type HiveVoteType = {
  voter: string;
  author: string;
  permlink: string;
  weight: number;
};

export type HiveTransferType = {
  from: string;
  to: string;
  amount: string;
  memo: number;
};

export type HiveCustomJsonType = {
  required_auths: string[];
  required_posting_auths: string[];
  id: string;
  json: string;
};

export type HiveAccountUpdateType = {
  account: string;
  posting: PostingType;
};

export type PostingType = {
  weight_threshold: string;
  account_auths: [string, number][];
  key_auths: [string, number][];
  memo_key: string;
  json_metadata: string;
};
