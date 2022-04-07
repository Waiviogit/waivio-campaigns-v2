import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PostDocumentType, PostFindType } from './types';
import { Post } from './post.schema';
import { PostRepositoryInterface } from './interface';

@Injectable()
export class PostRepository implements PostRepositoryInterface {
  private readonly logger = new Logger(PostRepository.name);
  constructor(
    @InjectModel(Post.name)
    private readonly model: Model<PostDocumentType>,
  ) {}

  async findOne({
    filter,
    projection,
    options,
  }: PostFindType): Promise<PostDocumentType> {
    try {
      return this.model.findOne(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
