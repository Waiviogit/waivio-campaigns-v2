import { WobjectSubscriptionsFindType } from '../types';
import { WobjectSubscriptions } from '../wobject-subscriptions.schema';

export interface WobjectSubscriptionsRepositoryInterface {
  find({
    filter,
    projection,
    options,
  }: WobjectSubscriptionsFindType): Promise<WobjectSubscriptions[]>;
  findUserSubscriptions(userName: string): Promise<WobjectSubscriptions[]>;
}
