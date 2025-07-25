import { UserSubscriptionsDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export interface UserSubscriptionRepositoryInterface
  extends MongoRepositoryInterface<UserSubscriptionsDocumentType> {
  findUserSubscriptions(userName: string): Promise<string[]>;
}
