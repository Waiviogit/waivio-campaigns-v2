import { PostDocumentType, PostFindType } from '../types';

export interface PostRepositoryInterface {
  findOne({
    filter,
    projection,
    options,
  }: PostFindType): Promise<PostDocumentType>;

  find({
    filter,
    projection,
    options,
  }: PostFindType): Promise<PostDocumentType[]>;
}
