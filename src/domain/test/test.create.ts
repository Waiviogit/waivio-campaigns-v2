import { Injectable, Inject } from '@nestjs/common';
import { Test } from './test.type';
import { TestRepository } from './test-repository.interface';

const TestRepo = () => Inject('UserRepo');

@Injectable()
export class TestCreate {
  constructor(@TestRepo() private readonly userRepository: TestRepository) {}

  public async create(userId: string, toUpdate: Partial<Test>): Promise<void> {
    await this.userRepository.create(userId, toUpdate);
  }
}
