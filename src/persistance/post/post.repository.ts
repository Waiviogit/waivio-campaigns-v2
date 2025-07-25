import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PostDocumentType } from './types';
import { Post } from './post.schema';

import { MongoRepository } from '../mongo.repository';

@Injectable()
export class PostRepository extends MongoRepository<PostDocumentType> {
  constructor(
    @InjectModel(Post.name)
    protected readonly model: Model<PostDocumentType>,
  ) {
    super(model, new Logger(PostRepository.name));
  }
}
