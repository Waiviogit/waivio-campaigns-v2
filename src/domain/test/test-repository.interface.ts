import { Test } from './test.type';

export interface TestRepository {
  create(userId: string, updatedFields: Partial<Test>): Promise<Test>;
  update(userId: string, updatedFields: Partial<Test>): Promise<Test>;
}
