export class HiveCommentDto {
  parent_author: string;
  parent_permlink: string;
  author: string;
  permlink: string;
  title: string;
  body: string;
  json_metadata: string;
}

export class HiveCommentOptionsDto {
  author: string;
  permlink: string;
  max_accepted_payout: MaxAcceptedPayoutDto;
  percent_hbd: number;
  allow_votes: boolean;
  allow_curation_rewards: boolean;
  extensions: [number, { beneficiaries: Beneficiaries[] }][];
}

class MaxAcceptedPayoutDto {
  amount: string;
  precision: number;
  nai: string;
}

class Beneficiaries {
  account: string;
  weight: number;
}
