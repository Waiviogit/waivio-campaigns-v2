import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppDocumentType } from './types';
import { App } from './app.schema';
import { AppRepositoryInterface } from './interface';
import { MongoRepository } from '../mongo.repository';

@Injectable()
export class AppRepository
  extends MongoRepository<AppDocumentType>
  implements AppRepositoryInterface
{
  constructor(
    @InjectModel(App.name)
    protected readonly model: Model<AppDocumentType>,
  ) {
    super(model, new Logger(AppRepository.name));
  }

  async findOneByHost(host: string): Promise<AppDocumentType> {
    return this.findOne({ filter: { host } });
  }
}
