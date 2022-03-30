import { UserFindOneType } from '../types';
import { User } from '../user.schema';

export interface UserRepositoryInterface {
  findOne(argument: UserFindOneType): Promise<User>;
}
