export type HiveBlock = {
  previous: string;
  timestamp: string;
  witness: string;
  transaction_merkle_root: string;
  extensions: [];
  witness_signature: string;
  block_id: string;
  transactions: HiveTransaction[];
  transaction_ids: string[];
};

export type HiveTransaction = {
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

export type HiveComment = {
  parent_author: string;
  parent_permlink: string;
  author: string;
  permlink: string;
  title: string;
  body: string;
  json_metadata: string;
};

export type HiveCommentOptions = {
  author: string;
  permlink: string;
  max_accepted_payout: MaxAcceptedPayout;
  percent_hbd: number;
  allow_votes: boolean;
  allow_curation_rewards: boolean;
  extensions: [number, { beneficiaries: Beneficiaries[] }][];
};

export type MaxAcceptedPayout = {
  amount: string;
  precision: number;
  nai: string;
};

export type Beneficiaries = {
  account: string;
  weight: number;
};

export type HiveVote = {
  voter: string;
  author: string;
  permlink: string;
  weight: number;
};

export type HiveTransfer = {
  from: string;
  to: string;
  amount: string;
  memo: number;
};

export type HiveCustomJson = {
  required_auths: string[];
  required_posting_auths: string[];
  id: string;
  json: string;
};

export type HiveAccountUpdate = {
  account: string;
  posting: Posting;
};

export type Posting = {
  weight_threshold: string;
  account_auths: [];
  key_auths: [string, number][];
  memo_key: string;
  json_metadata: string;
};
