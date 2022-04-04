import { UserSubscriptionsFindType } from '../types';
import { UserSubscriptions } from '../user-subscriptions.schema';

export interface UserSubscriptionRepositoryInterface {
  find({
    filter,
    projection,
    options,
  }: UserSubscriptionsFindType): Promise<UserSubscriptions[]>;
  findUserSubscriptions(userName: string): Promise<UserSubscriptions[]>;
}
