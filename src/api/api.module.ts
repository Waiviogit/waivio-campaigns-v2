import { CampaignController } from './campaign/campaign.controller';
import { CampaignService } from './campaign/campaign.service';
import { Module } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { PersistenceModule } from '../persistance/persistence.module';
import { CampaignsController } from './campaigns/campaigns.controller';
import { CampaignsService } from './campaigns/campaigns.service';
import { ReservationController } from './reservation/reservation.controller';
import { ReservationService } from './reservation/reservation.service';
import { RewardsController } from './rewards/rewards.controller';
import { RewardsService } from './rewards/rewards.service';
import { BlacklistsController } from './blacklists/blacklists.controller';
import { BlacklistsService } from './blacklists/blacklists.service';

@Module({
  imports: [DomainModule, PersistenceModule],
  controllers: [
    CampaignController,
    CampaignsController,
    ReservationController,
    RewardsController,
    BlacklistsController,
  ],
  providers: [
    CampaignService,
    CampaignsService,
    ReservationService,
    RewardsService,
    BlacklistsService,
  ],
})
export class ApiModule {}
