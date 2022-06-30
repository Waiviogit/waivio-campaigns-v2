import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import {
  BlacklistFindOneType,
  BlacklistDocumentType,
  BlacklistUpdateType,
} from './types';
import { Blacklist } from './blacklist.schema';
import { BlacklistRepositoryInterface } from './interface';

@Injectable()
export class BlacklistRepository implements BlacklistRepositoryInterface {
  private readonly logger = new Logger(BlacklistRepository.name);
  constructor(
    @InjectModel(Blacklist.name)
    private readonly model: Model<BlacklistDocumentType>,
  ) {}

  async findOne({
    filter,
    projection,
    options,
  }: BlacklistFindOneType): Promise<BlacklistDocumentType> {
    try {
      return this.model.findOne(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async find({
    filter,
    projection,
    options,
  }: BlacklistFindOneType): Promise<BlacklistDocumentType[]> {
    try {
      return this.model.findOne(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async updateOne({
    filter,
    update,
    options,
  }: BlacklistUpdateType): Promise<UpdateWriteOpResult> {
    try {
      return this.model.updateOne(filter, update, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
