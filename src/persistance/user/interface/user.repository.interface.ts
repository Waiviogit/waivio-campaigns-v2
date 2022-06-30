import { UserDocumentType, UserFindOneType } from '../types';

export interface UserRepositoryInterface {
  findOne({
    filter,
    projection,
    options,
  }: UserFindOneType): Promise<UserDocumentType>;

  find({
    filter,
    projection,
    options,
  }: UserFindOneType): Promise<UserDocumentType[]>;
  findByNames(names: string[]): Promise<string[]>;
}
