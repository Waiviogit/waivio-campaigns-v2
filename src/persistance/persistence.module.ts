import { Module } from '@nestjs/common';

import { CampaignPersistenceModule } from './campaign/campaign.persistence.module';
import { UserPersistenceModule } from './user/user.persistence.module';
import { WobjectPersistenceModule } from './wobject/wobject.persistence.module';
import { UserSubscriptionsPersistenceModule } from './user-subscriptions/user-subscriptions.persistence.module';
import { WobjectSubscriptionsPersistenceModule } from './wobject-subscriptions/wobject-subscriptions.persistence.module';
import { PostPersistenceModule } from './post/post.persistence.module';
import { AppPersistenceModule } from './app/app.persistence.module';
import { CurrencyRatesPersistenceModule } from './currency-rates/currency-rates.persistence.module';

@Module({
  imports: [
    CampaignPersistenceModule,
    UserPersistenceModule,
    WobjectPersistenceModule,
    UserSubscriptionsPersistenceModule,
    WobjectSubscriptionsPersistenceModule,
    PostPersistenceModule,
    AppPersistenceModule,
    CurrencyRatesPersistenceModule,
  ],
  exports: [
    CampaignPersistenceModule,
    UserPersistenceModule,
    WobjectPersistenceModule,
    UserSubscriptionsPersistenceModule,
    WobjectSubscriptionsPersistenceModule,
    PostPersistenceModule,
    AppPersistenceModule,
    CurrencyRatesPersistenceModule,
  ],
})
export class PersistenceModule {}
