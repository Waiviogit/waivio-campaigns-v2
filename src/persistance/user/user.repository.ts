import { UserRepositoryInterface } from './interface/user.repository.interface';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { User, UserDocumentType } from './user.schema';
import { UserFindOneType } from './types';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  private readonly logger = new Logger(UserRepository.name);
  constructor(
    @InjectModel(User.name)
    private readonly model: Model<UserDocumentType>,
  ) {}

  async findOne({
    filter,
    projection,
    options,
  }: UserFindOneType): Promise<User> {
    try {
      return this.model.findOne(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
