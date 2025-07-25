import { CampaignPostsDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export type CampaignPostsRepositoryInterface =
  MongoRepositoryInterface<CampaignPostsDocumentType>;
