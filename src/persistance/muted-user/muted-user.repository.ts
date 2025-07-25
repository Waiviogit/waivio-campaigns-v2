import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MutedUserDocumentType } from './types';
import { MutedUser } from './muted-user.schema';
import { MongoRepository } from '../mongo.repository';

@Injectable()
export class MutedUserRepository extends MongoRepository<MutedUserDocumentType> {
  constructor(
    @InjectModel(MutedUser.name)
    protected readonly model: Model<MutedUserDocumentType>,
  ) {
    super(model, new Logger(MutedUserRepository.name));
  }
}
