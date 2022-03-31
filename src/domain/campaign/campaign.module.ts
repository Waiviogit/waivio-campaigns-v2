import { Module } from '@nestjs/common';
import {
  CampaignProviderHelper,
  CreateCampaignProvider,
} from './campaign.provider';
import { PersistenceModule } from '../../persistance/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [CreateCampaignProvider, CampaignProviderHelper],
  exports: [CreateCampaignProvider],
})
export class CampaignModule {}
