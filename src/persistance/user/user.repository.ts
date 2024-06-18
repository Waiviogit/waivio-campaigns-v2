import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { User } from './user.schema';
import { UserCampaignType, UserDocumentType, UserFindOneType } from './types';
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
  }: UserFindOneType): Promise<UserDocumentType> {
    try {
      return this.model.findOne(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async find({
    filter,
    projection,
    options,
  }: UserFindOneType): Promise<UserDocumentType[]> {
    try {
      return this.model.find(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findByNames(names: string[]): Promise<string[]> {
    const users = await this.find({
      filter: { name: { $in: names } },
      projection: { name: 1 },
    });
    if (!users || !users.length) return;
    return _.map(users, 'name');
  }

  async findCampaignsUsers(names: string[]): Promise<UserCampaignType[]> {
    if (!names?.length) return [];

    return this.find({
      filter: { name: { $in: names } },
      projection: {
        name: 1,
        posting_json_metadata: 1,
        alias: 1,
        wobjects_weight: 1,
        profile_image: 1,
      },
    });
  }
}
