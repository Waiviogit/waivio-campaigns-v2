import { Provider } from '@nestjs/common';

import { CAMPAIGN_POSTS_PROVIDE } from '../../common/constants';

import { CampaignPostsRepository } from './campaign-posts.repository';

export const CampaignPostsPersistenceProvider: Provider = {
  provide: CAMPAIGN_POSTS_PROVIDE.REPOSITORY,
  useClass: CampaignPostsRepository,
};
