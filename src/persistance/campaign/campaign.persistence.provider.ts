import { Provider } from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { CAMPAIGN_PROVIDE } from '../../common/constants';

export const CampaignPersistenceProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.REPOSITORY,
  useClass: CampaignRepository,
};
