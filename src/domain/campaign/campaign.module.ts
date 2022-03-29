import { Module } from '@nestjs/common';
import { CreateCampaignProvider } from './campaign.provider';
import { PersistenceModule } from '../../persistance/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [CreateCampaignProvider],
  exports: [CreateCampaignProvider],
})
export class CampaignModule {}
