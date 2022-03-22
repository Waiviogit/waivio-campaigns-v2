import { Injectable, Inject } from '@nestjs/common';
import { Test } from './test.type';
import { TestRepository } from './test-repository.interface';

const TestRepo = () => Inject('TestRepo');

@Injectable()
export class TestCreate {
  constructor(@TestRepo() private readonly testRepository: TestRepository) {}

  public async create(name: string): Promise<Test> {
    return this.testRepository.create(name);
  }
}
