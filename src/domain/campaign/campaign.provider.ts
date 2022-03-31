import { Provider } from '@nestjs/common';
import { CAMPAIGN_PROVIDE } from '../../common/constants';

import { CreateCampaign } from './create-campaign';
import { CampaignHelper } from './campaign-helper';

export const CreateCampaignProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.CREATE_CAMPAIGN,
  useClass: CreateCampaign,
};

export const CampaignProviderHelper: Provider = {
  provide: CAMPAIGN_PROVIDE.CAMPAIGN_HELPER,
  useClass: CampaignHelper,
};
