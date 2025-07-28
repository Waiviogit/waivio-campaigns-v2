import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { User } from './user.schema';
import { UserCampaignType, UserDocumentType } from './types';
import { UserRepositoryInterface } from './interface';
import { MongoRepository } from '../mongo.repository';

@Injectable()
export class UserRepository
  extends MongoRepository<UserDocumentType>
  implements UserRepositoryInterface
{
  constructor(
    @InjectModel(User.name)
    protected readonly model: Model<UserDocumentType>,
  ) {
    super(model, new Logger(UserRepository.name));
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
