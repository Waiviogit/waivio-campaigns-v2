import { PostDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export type PostRepositoryInterface =
  MongoRepositoryInterface<PostDocumentType>;
