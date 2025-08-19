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
import { PayablesController } from './controllers/payables/payables.controller';
import { PayablesService } from './controllers/payables/payables.service';
import { BotsController } from './controllers/bots/bots.controller';
import { BotsService } from './controllers/bots/bots.service';
import { CommentQueueController } from './controllers/comment-queue.controller';

@Module({
  imports: [DomainModule, PersistenceModule],
  controllers: [
    CampaignController,
    CampaignsController,
    ReservationController,
    RewardsController,
    BlacklistsController,
    PayablesController,
    BotsController,
    CommentQueueController,
  ],
  providers: [
    CampaignService,
    CampaignsService,
    ReservationService,
    RewardsService,
    BlacklistsService,
    PayablesService,
    BotsService,
  ],
})
export class ApiModule {}
