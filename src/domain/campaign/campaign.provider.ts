import { Provider } from '@nestjs/common';
import { CAMPAIGN_PROVIDE } from '../../common/constants';

import { CreateCampaign } from './create-campaign';
import { CampaignHelper } from './campaign-helper';
import { UpdateCampaign } from './update-campaign';
import { DeleteCampaign } from './delete-campaign';
import { CampaignActivation } from './campaign-activation';
import {CampaignDeactivation} from "./campaign-deactivation";

export const CreateCampaignProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.CREATE_CAMPAIGN,
  useClass: CreateCampaign,
};

export const UpdateCampaignProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.UPDATE_CAMPAIGN,
  useClass: UpdateCampaign,
};

export const DeleteCampaignProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.DELETE_CAMPAIGN,
  useClass: DeleteCampaign,
};

export const CampaignProviderHelper: Provider = {
  provide: CAMPAIGN_PROVIDE.CAMPAIGN_HELPER,
  useClass: CampaignHelper,
};

export const CampaignActivationProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.ACTIVATE_CAMPAIGN,
  useClass: CampaignActivation,
};

export const CampaignDeactivationProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.DEACTIVATE_CAMPAIGN,
  useClass: CampaignDeactivation,
};
