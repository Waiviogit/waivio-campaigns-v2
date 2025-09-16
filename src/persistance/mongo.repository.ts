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

export type DeleteResultType = {
  acknowledged: boolean;
  deletedCount: number;
};

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

export interface MongoRepositoryInterface<
  TDocument,
  TCreate = Partial<TDocument>,
> {
  find(params: FindType<TDocument>): Promise<TDocument[]>;
  findOne(params: FindType<TDocument>): Promise<TDocument | null>;
  create(params: TCreate): Promise<TDocument | null>;
  findOneAndUpdate(params: UpdateType<TDocument>): Promise<TDocument | null>;
  updateOne(params: UpdateType<TDocument>): Promise<UpdateWriteOpResult | null>;
  updateMany(
    params: UpdateType<TDocument>,
  ): Promise<UpdateWriteOpResult | null>;
  findOneAndDelete(
    params: FindOneAndDeleteType<TDocument>,
  ): Promise<TDocument | null>;
  aggregate({ pipeline }: AggregateType): Promise<Aggregate<Array<never>>>;
  deleteOne(params: FindOneAndDeleteType<TDocument>): Promise<DeleteResultType>;
  deleteMany(
    params: FindOneAndDeleteType<TDocument>,
  ): Promise<DeleteResultType>;
}

@Injectable()
export abstract class MongoRepository<TDocument, TCreate = Partial<TDocument>>
  implements MongoRepositoryInterface<TDocument, TCreate>
{
  protected constructor(
    protected readonly model: Model<TDocument>,
    protected readonly logger: Logger,
  ) {}

  async find(params: FindType<TDocument>): Promise<TDocument[]> {
    try {
      return this.model
        .find(params.filter, params.projection, params.options)
        .lean();
    } catch (error) {
      this.logger.log(error.message);
      return [];
    }
  }

  async findOne(params: FindType<TDocument>): Promise<TDocument | null> {
    try {
      return this.model
        .findOne(params.filter, params.projection, params.options)
        .lean();
    } catch (error) {
      this.logger.log(error.message);
      return null;
    }
  }

  async findOneAndUpdate(
    params: UpdateType<TDocument>,
  ): Promise<TDocument | null> {
    try {
      return this.model
        .findOneAndUpdate(params.filter, params.update, params.options)
        .lean();
    } catch (error) {
      this.logger.log(error.message);
      return null;
    }
  }

  async updateOne(
    params: UpdateType<TDocument>,
  ): Promise<UpdateWriteOpResult | null> {
    try {
      return this.model.updateOne(params.filter, params.update, params.options);
    } catch (error) {
      this.logger.log(error.message);
      return null;
    }
  }

  async updateMany(
    params: UpdateType<TDocument>,
  ): Promise<UpdateWriteOpResult | null> {
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

  async findOneAndDelete(
    params: FindOneAndDeleteType<TDocument>,
  ): Promise<TDocument | null> {
    try {
      return this.model.findOneAndDelete(params.filter, params.options).lean();
    } catch (error) {
      this.logger.log(error.message);
      return null;
    }
  }

  async deleteOne(
    params: FindOneAndDeleteType<TDocument>,
  ): Promise<DeleteResultType> {
    try {
      return this.model.deleteOne(params.filter, params.options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async deleteMany(
    params: FindOneAndDeleteType<TDocument>,
  ): Promise<DeleteResultType> {
    try {
      return this.model.deleteMany(params.filter, params.options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async create(data: TCreate): Promise<TDocument | null> {
    try {
      return await this.model.create(data);
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
