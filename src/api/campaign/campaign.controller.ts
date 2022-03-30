import { Controller, Post, Body } from '@nestjs/common';
import { CampaignControllerDocs } from './campaign.controller.doc';
import { CreateCampaignDto } from '../../common/dto/in';

import { Campaign } from '../../persistance/campaign/campaign.schema';
import { CampaignService } from './campaign.service';

@Controller('campaign')
@CampaignControllerDocs.main()
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @CampaignControllerDocs.createCampaign()
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    return this.campaignService.create(createCampaignDto);
  }
}
