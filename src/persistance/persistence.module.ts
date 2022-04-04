import { Module } from '@nestjs/common';

import { CampaignPersistenceModule } from './campaign/campaign.persistence.module';
import { UserPersistenceModule } from './user/user.persistence.module';
import { WobjectPersistenceModule } from './wobject/wobject.persistence.module';
import { UserSubscriptionsPersistenceModule } from './user-subscriptions/user-subscriptions.persistence.module';
import { WobjectSubscriptionsPersistenceModule } from './wobject-subscriptions/wobject-subscriptions.persistence.module';

@Module({
  imports: [
    CampaignPersistenceModule,
    UserPersistenceModule,
    WobjectPersistenceModule,
    UserSubscriptionsPersistenceModule,
    WobjectSubscriptionsPersistenceModule,
  ],
  exports: [
    CampaignPersistenceModule,
    UserPersistenceModule,
    WobjectPersistenceModule,
    UserSubscriptionsPersistenceModule,
    WobjectSubscriptionsPersistenceModule,
  ],
})
export class PersistenceModule {}
