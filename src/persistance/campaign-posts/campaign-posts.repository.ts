import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CampaignPost } from './campaign-posts.schema';
import { CampaignPostsDocumentType } from './types';
import {
  CampaignPostCreateInterface,
  CampaignPostDeleteInterface,
  CampaignPostsRepositoryInterface,
} from './interface';
import { DeleteResultType } from '../types/mongo';

export class CampaignPostsRepository
  implements CampaignPostsRepositoryInterface
{
  private readonly logger = new Logger(CampaignPostsRepository.name);
  constructor(
    @InjectModel(CampaignPost.name)
    private readonly model: Model<CampaignPostsDocumentType>,
  ) {}

  async create(
    doc: CampaignPostCreateInterface,
  ): Promise<CampaignPostsDocumentType> {
    try {
      return this.model.create(doc);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async delete({
    filter,
    options,
  }: CampaignPostDeleteInterface): Promise<DeleteResultType> {
    try {
      return this.model.deleteOne(filter, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
