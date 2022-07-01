import { CampaignController } from './controllers/campaign/campaign.controller';
import { CampaignService } from './controllers/campaign/campaign.service';
import { Module } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { PersistenceModule } from '../persistance/persistence.module';
import { CampaignsController } from './controllers/campaigns/campaigns.controller';
import { CampaignsService } from './controllers/campaigns/campaigns.service';
import { ReservationController } from './controllers/reservation/reservation.controller';
import { ReservationService } from './controllers/reservation/reservation.service';
import { RewardsController } from './controllers/rewards/rewards.controller';
import { RewardsService } from './controllers/rewards/rewards.service';
import { BlacklistsController } from './controllers/blacklists/blacklists.controller';
import { BlacklistsService } from './controllers/blacklists/blacklists.service';

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
