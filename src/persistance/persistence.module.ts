import { Module } from '@nestjs/common';

import { CampaignPersistenceModule } from './campaign/campaign.persistence.module';

@Module({
  imports: [CampaignPersistenceModule],
  exports: [CampaignPersistenceModule],
})
export class PersistenceModule {}
