import { Injectable, Logger } from '@nestjs/common';
import {
  Aggregate,
  FilterQuery,
  Model,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from 'mongoose';
import { AggregateType } from './campaign/types';

export type FindType<T> = {
  filter: FilterQuery<T>;
  projection?: object | string | string[];
  options?: QueryOptions;
};

export type UpdateType<T> = {
  filter: FilterQuery<T>;
  update: UpdateWithAggregationPipeline | UpdateQuery<T>;
  options?: QueryOptions;
};

export type FindOneAndDeleteType<T> = {
  filter: FilterQuery<T>;
  options?: QueryOptions;
};

export interface MongoRepositoryInterface<T> {
  find(params: FindType<T>): Promise<T[]>;
  findOne(params: FindType<T>): Promise<T | null>;
  create(params: T): Promise<T | null>;
  findOneAndUpdate(params: UpdateType<T>): Promise<T | null>;
  updateOne(params: UpdateType<T>): Promise<UpdateWriteOpResult | null>;
  updateMany(params: UpdateType<T>): Promise<UpdateWriteOpResult | null>;
  findOneAndDelete(params: FindOneAndDeleteType<T>): Promise<T | null>;
  aggregate({ pipeline }: AggregateType): Promise<Aggregate<Array<never>>>;
}

@Injectable()
export abstract class MongoRepository<T>
  implements MongoRepositoryInterface<T>
{
  protected constructor(
    protected readonly model: Model<T>,
    protected readonly logger: Logger,
  ) {}

  async find(params: FindType<T>): Promise<T[]> {
    try {
      return this.model
        .find(params.filter, params.projection, params.options)
        .lean();
    } catch (error) {
      this.logger.log(error.message);
      return [];
    }
  }

  async findOne(params: FindType<T>): Promise<T | null> {
    try {
      return this.model
        .findOne(params.filter, params.projection, params.options)
        .lean();
    } catch (error) {
      this.logger.log(error.message);
      return null;
    }
  }

  async findOneAndUpdate(params: UpdateType<T>): Promise<T | null> {
    try {
      return this.model
        .findOneAndUpdate(params.filter, params.update, params.options)
        .lean();
    } catch (error) {
      this.logger.log(error.message);
      return null;
    }
  }

  async updateOne(params: UpdateType<T>): Promise<UpdateWriteOpResult | null> {
    try {
      return this.model.updateOne(params.filter, params.update, params.options);
    } catch (error) {
      this.logger.log(error.message);
      return null;
    }
  }

  async updateMany(params: UpdateType<T>): Promise<UpdateWriteOpResult | null> {
    try {
      return this.model.updateMany(
        params.filter,
        params.update,
        params.options,
      );
    } catch (error) {
      this.logger.log(error.message);
      return null;
    }
  }

  async findOneAndDelete(params: FindOneAndDeleteType<T>): Promise<T | null> {
    try {
      return this.model.findOneAndDelete(params.filter, params.options).lean();
    } catch (error) {
      this.logger.log(error.message);
      return null;
    }
  }

  async create(data: T): Promise<T | null> {
    try {
      return this.model.create(data);
    } catch (error) {
      this.logger.log(error.message);
      return null;
    }
  }

  async aggregate({
    pipeline,
  }: AggregateType): Promise<Aggregate<Array<never>>> {
    try {
      return this.model.aggregate(pipeline);
    } catch (error) {
      this.logger.log(error.message);
      return [];
    }
  }
}
