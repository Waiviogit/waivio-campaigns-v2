import { CampaignController } from './campaign/campaign.controller';
import { CampaignService } from './campaign/campaign.service';
import { Module } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { PersistenceModule } from '../persistance/persistence.module';
import { CampaignsController } from './campaigns/campaigns.controller';
import { CampaignsService } from './campaigns/campaigns.service';

@Module({
  imports: [DomainModule, PersistenceModule],
  controllers: [CampaignController, CampaignsController],
  providers: [CampaignService, CampaignsService],
})
export class ApiModule {}
