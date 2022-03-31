import { Controller, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { CampaignControllerDocs } from './campaign.controller.doc';
import { CreateCampaignDto } from '../../common/dto/in';

import { Campaign } from '../../persistance/campaign/campaign.schema';
import { CampaignService } from './campaign.service';
import { UpdateCampaignDto } from '../../common/dto/in/update-campaign.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('campaign')
@CampaignControllerDocs.main()
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}
  //TODO
  //@UseGuards(AuthGuard)
  @Post()
  @CampaignControllerDocs.createCampaign()
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    return this.campaignService.create(createCampaignDto);
  }
  //TODO add param account from header check guide name in separate guard
  //@UseGuards(AuthGuard)
  @Patch()
  @CampaignControllerDocs.updateCampaign()
  async update(@Body() updateCampaignDto: UpdateCampaignDto) {
    console.log('yo');
  }
}
