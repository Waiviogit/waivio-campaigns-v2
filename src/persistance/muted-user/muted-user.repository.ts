import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MutedUserDocumentType, MutedUserFindOneType } from './types';
import { MutedUser } from './muted-user.schema';
import { MutedUserRepositoryInterface } from './interface';

@Injectable()
export class MutedUserRepository implements MutedUserRepositoryInterface {
  private readonly logger = new Logger(MutedUserRepository.name);
  constructor(
    @InjectModel(MutedUser.name)
    private readonly model: Model<MutedUserDocumentType>,
  ) {}

  async find({
    filter,
    projection,
    options,
  }: MutedUserFindOneType): Promise<MutedUserDocumentType[]> {
    try {
      return this.model.find(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
