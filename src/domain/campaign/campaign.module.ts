import { Module } from '@nestjs/common';
import {
  CampaignActivationProvider,
  CampaignProviderHelper,
  CreateCampaignProvider,
  DeleteCampaignProvider,
  UpdateCampaignProvider,
} from './campaign.provider';
import { PersistenceModule } from '../../persistance/persistence.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PersistenceModule, NotificationsModule],
  providers: [
    CreateCampaignProvider,
    CampaignProviderHelper,
    UpdateCampaignProvider,
    DeleteCampaignProvider,
    CampaignActivationProvider,
  ],
  exports: [
    CreateCampaignProvider,
    UpdateCampaignProvider,
    DeleteCampaignProvider,
    CampaignActivationProvider,
  ],
})
export class CampaignModule {}
