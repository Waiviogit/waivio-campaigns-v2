import {
  UserSubscriptionsDocumentType,
  UserSubscriptionsFindType,
} from '../types';

export interface UserSubscriptionRepositoryInterface {
  find({
    filter,
    projection,
    options,
  }: UserSubscriptionsFindType): Promise<UserSubscriptionsDocumentType[]>;
  findUserSubscriptions(userName: string): Promise<string[]>;
}
