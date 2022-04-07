import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppDocumentType } from './types';
import { App } from './app.schema';
import { AppFindType } from './types/app.repository.types';
import { AppRepositoryInterface } from './interface';

@Injectable()
export class AppRepository implements AppRepositoryInterface {
  private readonly logger = new Logger(AppRepository.name);
  constructor(
    @InjectModel(App.name)
    private readonly model: Model<AppDocumentType>,
  ) {}

  async findOne({ filter, projection, options }: AppFindType): Promise<AppDocumentType> {
    try {
      return this.model.findOne(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOneByHost(host: string): Promise<AppDocumentType> {
    return this.findOne({ filter: { host } });
  }
}
