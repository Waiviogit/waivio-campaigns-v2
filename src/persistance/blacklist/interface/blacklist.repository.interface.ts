import { BlacklistDocumentType, BlacklistFindOneType } from '../types';

export interface BlacklistRepositoryInterface {
  findOne({
    filter,
    projection,
    options,
  }: BlacklistFindOneType): Promise<BlacklistDocumentType>;
}
