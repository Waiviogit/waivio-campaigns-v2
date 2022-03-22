import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Test, TestDocument } from './test.schema';

@Injectable()
export class TestRepository {
  constructor(
    @InjectModel(Test.name)
    private readonly model: Model<TestDocument>,
  ) {}

  async create(name: string): Promise<Test> {
    return await new this.model({ name }).save();
  }
}
