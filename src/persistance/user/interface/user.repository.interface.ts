import { UserCampaignType, UserDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export interface UserRepositoryInterface
  extends MongoRepositoryInterface<UserDocumentType> {
  findByNames(names: string[]): Promise<string[]>;
  findCampaignsUsers(names: string[]): Promise<UserCampaignType[]>;
}
