import {
  Document,
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { BlacklistDocumentType } from './blacklist.types';
import { Blacklist } from '../blacklist.schema';

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

export type BlacklistFindOneTypeOut = Blacklist & {
  followLists: Blacklist[];
} & Document;
