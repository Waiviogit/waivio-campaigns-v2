import { Module } from '@nestjs/common';

import { SponsorsBotProvider } from './sponsors-bot.provider';
import { PersistenceModule } from '../../persistance/persistence.module';
import { CampaignProviderHelper } from '../campaign/campaign.provider';

@Module({
  imports: [PersistenceModule],
  providers: [SponsorsBotProvider, CampaignProviderHelper],
  exports: [SponsorsBotProvider],
})
export class SponsorsBotModule {}
