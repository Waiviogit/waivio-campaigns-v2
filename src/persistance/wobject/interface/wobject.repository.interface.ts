import { WobjectDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export interface WobjectRepositoryInterface
  extends MongoRepositoryInterface<WobjectDocumentType> {
  findUnavailableByLink(author_permlink: string): Promise<WobjectDocumentType>;
  updateCampaignsCount(
    _id: string,
    status: string,
    links: string[],
  ): Promise<void>;
  findOneByPermlink(author_permlink: string): Promise<WobjectDocumentType>;
}
