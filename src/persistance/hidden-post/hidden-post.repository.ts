import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HiddenPost } from './hidden-post.schema';
import { Model } from 'mongoose';
import { HiddenPostDocumentType, HiddenPostFindOneType } from './types';
import { HiddenPostRepositoryInterface } from './interface';

@Injectable()
export class HiddenPostRepository implements HiddenPostRepositoryInterface {
  private readonly logger = new Logger(HiddenPostRepository.name);
  constructor(
    @InjectModel(HiddenPost.name)
    private readonly model: Model<HiddenPostDocumentType>,
  ) {}

  async find({
    filter,
    projection,
    options,
  }: HiddenPostFindOneType): Promise<HiddenPostDocumentType[]> {
    try {
      return this.model.find(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOne({
    filter,
    projection,
    options,
  }: HiddenPostFindOneType): Promise<HiddenPostDocumentType> {
    try {
      return this.model.findOne(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
