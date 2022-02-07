export class HiveAccountUpdateDto {
  account: string;
  posting: PostingDto;
}

class PostingDto {
  weight_threshold: string;
  account_auths: [];
  key_auths: [string, number][];
  memo_key: string;
  json_metadata: string;
}
