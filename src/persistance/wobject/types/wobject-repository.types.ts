import {
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { WobjectDocumentType } from './wobject.types';

export type WobjectFindType = {
  filter: FilterQuery<WobjectDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};

export type WobjectUpdateType = {
  filter: FilterQuery<WobjectDocumentType>;
  update: UpdateWithAggregationPipeline | UpdateQuery<WobjectDocumentType>;
  options?: QueryOptions;
};
