import { WobjectSubscriptionsDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export interface WobjectSubscriptionsRepositoryInterface
  extends MongoRepositoryInterface<WobjectSubscriptionsDocumentType> {
  findUserSubscriptions(objectLink: string): Promise<string[]>;
}
