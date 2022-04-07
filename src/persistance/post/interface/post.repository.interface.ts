import { PostDocumentType, PostFindType } from '../types';

export interface PostRepositoryInterface {
  findOne({
    filter,
    projection,
    options,
  }: PostFindType): Promise<PostDocumentType>;
}
