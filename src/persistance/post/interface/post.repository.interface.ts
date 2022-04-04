import { PostFindType } from '../types';
import { Post } from '../post.schema';

export interface PostRepositoryInterface {
  findOne({ filter, projection, options }: PostFindType): Promise<Post>;
}
