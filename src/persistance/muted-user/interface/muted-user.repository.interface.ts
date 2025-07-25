import { MutedUserDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export type MutedUserRepositoryInterface =
  MongoRepositoryInterface<MutedUserDocumentType>;
