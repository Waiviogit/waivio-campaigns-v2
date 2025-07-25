import { BlacklistDocumentType, BlacklistFindOneTypeOut } from '../types';

import { FindType, MongoRepositoryInterface } from '../../mongo.repository';

export interface BlacklistRepositoryInterface
  extends MongoRepositoryInterface<BlacklistDocumentType> {
  findOne(
    params: FindType<BlacklistDocumentType>,
  ): Promise<BlacklistFindOneTypeOut>;
}
