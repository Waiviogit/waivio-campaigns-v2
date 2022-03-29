import { Controller, Post, Body, Inject } from '@nestjs/common';
import { CampaignControllerDocs } from './campaign.controller.doc';
import { CreateCampaignDto } from '../../common/dto/in';
import { CreateCampaignInterface } from '../../domain/campaign/interface/create-campaign.interface';
import { CAMPAIGN_PROVIDE } from '../../common/constants';
import { Campaign } from '../../persistance/campaign/campaign.schema';
import { CampaignService } from './campaign.service';

@Controller('campaign')
@CampaignControllerDocs.main()
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    @Inject(CAMPAIGN_PROVIDE.CREATE_CAMPAIGN)
    private readonly createCampaign: CreateCampaignInterface,
  ) {}

  @Post()
  @CampaignControllerDocs.createCampaign()
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    return this.createCampaign.create(createCampaignDto);
  }
}
