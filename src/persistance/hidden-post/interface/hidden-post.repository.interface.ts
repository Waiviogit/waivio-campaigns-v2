import { HiddenPostDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export type HiddenPostRepositoryInterface =
  MongoRepositoryInterface<HiddenPostDocumentType>;
