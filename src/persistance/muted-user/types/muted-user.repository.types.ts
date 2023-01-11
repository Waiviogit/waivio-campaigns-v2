import { FilterQuery, QueryOptions } from 'mongoose';
import { MutedUserDocumentType } from './muted-user.types';

export type MutedUserFindOneType = {
  filter: FilterQuery<MutedUserDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
