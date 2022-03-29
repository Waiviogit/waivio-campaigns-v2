import { Provider } from '@nestjs/common';
import { CAMPAIGN_PROVIDE } from '../../common/constants';

import { CreateCampaign } from './create-campaign';

export const CreateCampaignProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.CREATE_CAMPAIGN,
  useClass: CreateCampaign,
};
