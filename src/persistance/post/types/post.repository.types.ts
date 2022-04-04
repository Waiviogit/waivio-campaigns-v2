import { FilterQuery, QueryOptions } from 'mongoose';

import { PostDocumentType } from './post.types';

export type PostFindType = {
  filter: FilterQuery<PostDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
