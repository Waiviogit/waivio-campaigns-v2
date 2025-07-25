import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CampaignPost } from './campaign-posts.schema';
import { CampaignPostsDocumentType } from './types';
import { CampaignPostsRepositoryInterface } from './interface';

import { MongoRepository } from '../mongo.repository';

export class CampaignPostsRepository
  extends MongoRepository<CampaignPostsDocumentType>
  implements CampaignPostsRepositoryInterface
{
  constructor(
    @InjectModel(CampaignPost.name)
    protected readonly model: Model<CampaignPostsDocumentType>,
  ) {
    super(model, new Logger(CampaignPostsRepository.name));
  }
}
