import { FilterQuery, QueryOptions } from 'mongoose';

import { BlacklistDocumentType } from './blacklist.types';

export type BlacklistFindOneType = {
  filter: FilterQuery<BlacklistDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
