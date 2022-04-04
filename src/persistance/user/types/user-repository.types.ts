import { FilterQuery, QueryOptions } from 'mongoose';
import { UserDocumentType } from './user.types';

export type UserFindOneType = {
  filter: FilterQuery<UserDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
