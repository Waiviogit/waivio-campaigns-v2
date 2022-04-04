import { FilterQuery, QueryOptions } from 'mongoose';
import { WobjectSubscriptionsDocumentType } from './wobject-subscriptions.types';

export type WobjectSubscriptionsFindType = {
  filter: FilterQuery<WobjectSubscriptionsDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
