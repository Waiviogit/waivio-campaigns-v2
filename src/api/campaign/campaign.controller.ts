import {
  Controller,
  Post,
  Body,
  Patch,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { CampaignControllerDocs } from './campaign.controller.doc';
import {
  CreateCampaignDto,
  DeleteCampaignDto,
  UpdateCampaignDto,
} from '../../common/dto/in';
import { Campaign } from '../../persistance/campaign/campaign.schema';
import { CampaignService } from './campaign.service';

import { AuthGuard, ChangeCampaignGuard } from '../guards';

@Controller('campaign')
@CampaignControllerDocs.main()
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @UseGuards(AuthGuard)
  @CampaignControllerDocs.createCampaign()
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    return this.campaignService.create(createCampaignDto);
  }

  @Patch()
  @UseGuards(ChangeCampaignGuard, AuthGuard)
  @CampaignControllerDocs.updateCampaign()
  async update(
    @Body() updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign> {
    return this.campaignService.update(updateCampaignDto);
  }

  @Delete()
  @UseGuards(ChangeCampaignGuard, AuthGuard)
  @CampaignControllerDocs.updateCampaign()
  async delete(
    @Body() deleteCampaignDto: DeleteCampaignDto,
  ): Promise<Campaign> {
    return this.campaignService.delete(deleteCampaignDto);
  }
}
