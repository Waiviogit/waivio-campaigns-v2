import { CampaignController } from './campaign/campaign.controller';
import { CampaignService } from './campaign/campaign.service';
import { Module } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [CampaignController],
  providers: [CampaignService],
})
export class ApiModule {}
