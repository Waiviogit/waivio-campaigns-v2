import { Provider } from '@nestjs/common';
import { POST_PROVIDE } from '../../common/constants';
import { PostRepository } from './post.repository';

export const PostPersistenceProvider: Provider = {
  provide: POST_PROVIDE.REPOSITORY,
  useClass: PostRepository,
};
