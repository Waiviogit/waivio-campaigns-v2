import { Test } from './test.type';

export interface TestRepository {
  create(name: string): Promise<Test>;
  // update(userId: string, updatedFields: Partial<Test>): Promise<Test>;
}
