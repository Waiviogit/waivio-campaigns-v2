import { FilterQuery, QueryOptions } from 'mongoose';
import { HiddenPostDocumentType } from './hidden-post.types';

export type HiddenPostFindOneType = {
  filter: FilterQuery<HiddenPostDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
