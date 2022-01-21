import { Controller, Post, Body } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto';

@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post('create')
  async create(@Body() createCampaignDto: CreateCampaignDto) {
    return await this.campaignService.createCampaign(createCampaignDto);
  }
}
