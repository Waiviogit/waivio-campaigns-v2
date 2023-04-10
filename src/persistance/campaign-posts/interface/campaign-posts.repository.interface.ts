import { CampaignPostsDocumentType } from '../types';
import { FilterQuery, QueryOptions } from 'mongoose';
import { DeleteResultType } from '../../types/mongo';

export interface CampaignPostsRepositoryInterface {
  create(doc: CampaignPostCreateInterface): Promise<CampaignPostsDocumentType>;
  delete({
    filter,
    options,
  }: CampaignPostDeleteInterface): Promise<DeleteResultType>;
}

export interface CampaignPostCreateInterface {
  author: string;
  permlink: string;
  rewardInToken: number;
  payoutTokenRateUSD: number;
  symbol: string;
  guideName: string;
  reservationPermlink: string;
}

export interface CampaignPostDeleteInterface {
  filter: FilterQuery<CampaignPostsDocumentType>;
  options?: QueryOptions;
}
