import { UserFindOneType } from '../types';
import { User } from '../user.schema';

export interface UserRepositoryInterface {
  findOne({ filter, projection, options }: UserFindOneType): Promise<User>;
}
