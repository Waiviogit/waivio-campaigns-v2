import { Module } from '@nestjs/common';
import {
  CampaignProviderHelper,
  CreateCampaignProvider,
  DeleteCampaignProvider,
  UpdateCampaignProvider,
} from './campaign.provider';
import { PersistenceModule } from '../../persistance/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [
    CreateCampaignProvider,
    CampaignProviderHelper,
    UpdateCampaignProvider,
    DeleteCampaignProvider,
  ],
  exports: [
    CreateCampaignProvider,
    UpdateCampaignProvider,
    DeleteCampaignProvider,
  ],
})
export class CampaignModule {}
