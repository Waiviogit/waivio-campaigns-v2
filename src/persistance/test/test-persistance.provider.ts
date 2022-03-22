import { Provider } from '@nestjs/common';
import { TestRepository } from './repository';

export const TestRepoProvider: Provider = {
  provide: 'TestRepo',
  useClass: TestRepository,
};
