import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlacklistDocumentType } from './types';
import { Blacklist } from './blacklist.schema';
import { BlacklistRepositoryInterface } from './interface';
import { MongoRepository } from '../mongo.repository';
import { BlacklistFindOneTypeOut } from './types';
import { FindType } from '../mongo.repository';

@Injectable()
export class BlacklistRepository
  extends MongoRepository<BlacklistDocumentType>
  implements BlacklistRepositoryInterface
{
  constructor(
    @InjectModel(Blacklist.name)
    protected readonly model: Model<BlacklistDocumentType>,
  ) {
    super(model, new Logger(BlacklistRepository.name));
  }

  async findOne(
    params: FindType<BlacklistDocumentType>,
  ): Promise<BlacklistFindOneTypeOut> {
    const doc = await super.findOne(params);
    if (!doc) return null as unknown as BlacklistFindOneTypeOut;
    // Populate followLists as Blacklist[]
    const followLists = await this.model
      .find({ user: { $in: doc.followLists } })
      .lean();
    return {
      ...doc,
      followLists,
    } as unknown as BlacklistFindOneTypeOut;
  }
}
