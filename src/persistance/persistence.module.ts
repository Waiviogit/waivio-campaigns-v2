import { Module } from '@nestjs/common';

import { TestRepositoryModule } from './test/test-repository.module';
import { CampaignPersistenceModule } from './campaign/campaign.persistence.module';

@Module({
  imports: [TestRepositoryModule, CampaignPersistenceModule],
  exports: [TestRepositoryModule, CampaignPersistenceModule],
})
export class PersistenceModule {}
