import { WobjectSubscriptionsFindType } from '../types';
import { WobjectSubscriptions } from '../wobject-subscriptions.schema';

export interface WobjectSubscriptionsRepositoryInterface {
  find({
    filter,
    projection,
    options,
  }: WobjectSubscriptionsFindType): Promise<WobjectSubscriptions[]>;
  /*
Domain
 */
  findUserSubscriptions(objectLink: string): Promise<string[]>;
}
