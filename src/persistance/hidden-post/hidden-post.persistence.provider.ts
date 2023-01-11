import { Provider } from '@nestjs/common';
import { HIDDEN_POST_PROVIDE } from '../../common/constants';
import { HiddenPostRepository } from './hidden-post.repository';

export const HiddenPostPersistenceProvider: Provider = {
  provide: HIDDEN_POST_PROVIDE.REPOSITORY,
  useClass: HiddenPostRepository,
};
