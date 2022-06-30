import {
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { BlacklistDocumentType } from './blacklist.types';

export type BlacklistFindOneType = {
  filter: FilterQuery<BlacklistDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};

export type BlacklistUpdateType = {
  filter: FilterQuery<BlacklistDocumentType>;
  update: UpdateWithAggregationPipeline | UpdateQuery<BlacklistDocumentType>;
  options?: QueryOptions;
};
