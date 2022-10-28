import { Module } from '@nestjs/common';

import { CampaignPersistenceModule } from './campaign/campaign.persistence.module';
import { UserPersistenceModule } from './user/user.persistence.module';
import { WobjectPersistenceModule } from './wobject/wobject.persistence.module';
import { UserSubscriptionsPersistenceModule } from './user-subscriptions/user-subscriptions.persistence.module';
import { WobjectSubscriptionsPersistenceModule } from './wobject-subscriptions/wobject-subscriptions.persistence.module';
import { PostPersistenceModule } from './post/post.persistence.module';
import { AppPersistenceModule } from './app/app.persistence.module';
import { CurrencyRatesPersistenceModule } from './currency-rates/currency-rates.persistence.module';
import { CampaignPaymentPersistenceModule } from './campaign-payment/campaign-payment.persistence.module';
import { SponsorsBotPersistenceModule } from './sponsors-bot/sponsors-bot.persistence.module';
import { SponsorsBotUpvotePersistenceModule } from './sponsors-bot-upvote/sponsors-bot-upvote.persistence.module';
import { BlacklistPersistenceModule } from './blacklist/blacklist.persistence.module';
import { CampaignPostsPersistenceModule } from './campaign-posts/campaign-posts.persistence.module';

@Module({
  imports: [
    BlacklistPersistenceModule,
    CampaignPersistenceModule,
    UserPersistenceModule,
    WobjectPersistenceModule,
    UserSubscriptionsPersistenceModule,
    WobjectSubscriptionsPersistenceModule,
    PostPersistenceModule,
    AppPersistenceModule,
    CurrencyRatesPersistenceModule,
    CampaignPaymentPersistenceModule,
    SponsorsBotPersistenceModule,
    SponsorsBotUpvotePersistenceModule,
    CampaignPostsPersistenceModule,
  ],
  exports: [
    BlacklistPersistenceModule,
    CampaignPersistenceModule,
    UserPersistenceModule,
    WobjectPersistenceModule,
    UserSubscriptionsPersistenceModule,
    WobjectSubscriptionsPersistenceModule,
    PostPersistenceModule,
    AppPersistenceModule,
    CurrencyRatesPersistenceModule,
    CampaignPaymentPersistenceModule,
    SponsorsBotPersistenceModule,
    SponsorsBotUpvotePersistenceModule,
    CampaignPostsPersistenceModule,
  ],
})
export class PersistenceModule {}
