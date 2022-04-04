import { FilterQuery, QueryOptions } from 'mongoose';
import { UserSubscriptionsDocumentType } from './user-subscriptions.types';

export type UserSubscriptionsFindType = {
  filter: FilterQuery<UserSubscriptionsDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
