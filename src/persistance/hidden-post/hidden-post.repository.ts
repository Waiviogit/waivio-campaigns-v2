import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HiddenPost } from './hidden-post.schema';
import { Model } from 'mongoose';
import { HiddenPostDocumentType } from './types';
import { MongoRepository } from '../mongo.repository';

@Injectable()
export class HiddenPostRepository extends MongoRepository<HiddenPostDocumentType> {
  constructor(
    @InjectModel(HiddenPost.name)
    protected readonly model: Model<HiddenPostDocumentType>,
  ) {
    super(model, new Logger(HiddenPostRepository.name));
  }
}
