import { Module } from '@nestjs/common';

import { CampaignPersistenceModule } from './campaign/campaign.persistence.module';
import { UserPersistenceModule } from './user/user.persistence.module';

@Module({
  imports: [CampaignPersistenceModule, UserPersistenceModule],
  exports: [CampaignPersistenceModule, UserPersistenceModule],
})
export class PersistenceModule {}
