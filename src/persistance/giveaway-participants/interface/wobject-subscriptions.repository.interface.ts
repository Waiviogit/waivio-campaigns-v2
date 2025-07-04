import {
  WobjectSubscriptionsDocumentType,
  WobjectSubscriptionsFindType,
} from '../types';

export interface WobjectSubscriptionsRepositoryInterface {
  find({
    filter,
    projection,
    options,
  }: WobjectSubscriptionsFindType): Promise<WobjectSubscriptionsDocumentType[]>;
  /*
Domain
 */
  findUserSubscriptions(objectLink: string): Promise<string[]>;
}
