import { Module } from '@nestjs/common';

import { SponsorsBotProvider } from './sponsors-bot.provider';
import { PersistenceModule } from '../../persistance/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [SponsorsBotProvider],
  exports: [SponsorsBotProvider],
})
export class SponsorsBotModule {}
