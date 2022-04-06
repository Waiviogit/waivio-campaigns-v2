import { FilterQuery, QueryOptions } from 'mongoose';

import { AppDocumentType } from './app.types';

export type AppFindType = {
  filter: FilterQuery<AppDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
