import { HiveCommentOptionsType, HiveCommentType } from '../../../common/types';

export type Beneficiary = {
  account: string;
  weight: number;
};

export type HiveCommentParseType = {
  comment: HiveCommentType;
  options: HiveCommentOptionsType;
  transaction_id: string;
};
