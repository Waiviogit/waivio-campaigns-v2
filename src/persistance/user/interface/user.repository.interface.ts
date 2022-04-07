import { UserDocumentType, UserFindOneType } from '../types';

export interface UserRepositoryInterface {
  findOne({
    filter,
    projection,
    options,
  }: UserFindOneType): Promise<UserDocumentType>;
}
