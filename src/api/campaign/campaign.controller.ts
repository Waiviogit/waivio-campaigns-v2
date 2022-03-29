import { Controller, Post, Body, Get, Inject } from '@nestjs/common';

import { CampaignControllerDocs } from './campaign.controller.doc';
import { TestCreate } from '../../domain/test/test.create';
import { CreateCampaignDto } from '../../common/dto/in';
import { CreateCampaignInterface } from '../../domain/campaign/interface/create-campaign.interface';
import { CAMPAIGN_PROVIDE } from '../../common/constants';

@Controller('campaign')
@CampaignControllerDocs.main()
export class CampaignController {
  constructor(
    private readonly testCreate: TestCreate,
    @Inject(CAMPAIGN_PROVIDE.CREATE_CAMPAIGN)
    private readonly createCampaign: CreateCampaignInterface,
  ) {}

  @Post()
  @CampaignControllerDocs.createCampaign()
  async create(@Body() createCampaignDto: CreateCampaignDto) {
    return await this.createCampaign.create(createCampaignDto);
  }

  @Get('test')
  async test() {
    console.log('sended -----------');
    return this.testCreate.create('test');
  }
}
