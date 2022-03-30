import { FilterQuery, QueryOptions } from 'mongoose';
import { CampaignDocumentType } from '../campaign.schema';

export type CampaignFindOneType = {
  filter: FilterQuery<CampaignDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
