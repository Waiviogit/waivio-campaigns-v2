import { Provider } from '@nestjs/common';
import { CAMPAIGN_PROVIDE } from '../../common/constants';

import { CreateCampaign } from './create-campaign';
import { CampaignHelper } from './campaign-helper';
import { UpdateCampaign } from './update-campaign';
import { DeleteCampaign } from './delete-campaign';
import { CampaignActivation } from './campaign-activation';
import { CampaignDeactivation } from './campaign-deactivation';
import { GuideCampaigns } from './guide-campaigns';
import { DebtObligations } from './debt-obligations';
import { CampaignSuspend } from './campaign-suspend';
import { CampaignExpiredListener } from './campaign-expired-listener';
import { CampaignDetails } from './campaign-details';

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

export const GuideCampaignsProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.GUIDE_CAMPAIGNS,
  useClass: GuideCampaigns,
};

export const DebtObligationsProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.DEBT_OBLIGATIONS,
  useClass: DebtObligations,
};

export const CampaignSuspendProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.SUSPEND,
  useClass: CampaignSuspend,
};

export const CampaignExpiredListenerProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.EXPIRED_LISTENER,
  useClass: CampaignExpiredListener,
};

export const CampaignDetailsProvider: Provider = {
  provide: CAMPAIGN_PROVIDE.CAMPAIGN_DETAILS,
  useClass: CampaignDetails,
};
