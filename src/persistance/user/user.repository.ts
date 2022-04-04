import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { UserDocumentType, UserFindOneType } from './types';
import { UserRepositoryInterface } from './interface';

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
