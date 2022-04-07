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
import { CampaignService } from './campaign.service';

import { AuthGuard, ChangeCampaignGuard } from '../guards';
import {
  CreateCampaignOutDto,
  DeleteCampaignOutDto,
  UpdateCampaignOutDto,
} from '../../common/dto/out';

@Controller('campaign')
@CampaignControllerDocs.main()
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @UseGuards(AuthGuard)
  @CampaignControllerDocs.createCampaign()
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
  ): Promise<CreateCampaignOutDto> {
    return this.campaignService.create(createCampaignDto);
  }

  @Patch()
  @UseGuards(ChangeCampaignGuard, AuthGuard)
  @CampaignControllerDocs.updateCampaign()
  async update(
    @Body() updateCampaignDto: UpdateCampaignDto,
  ): Promise<UpdateCampaignOutDto> {
    return this.campaignService.update(updateCampaignDto);
  }

  @Delete()
  @UseGuards(ChangeCampaignGuard, AuthGuard)
  @CampaignControllerDocs.deleteCampaign()
  async delete(
    @Body() deleteCampaignDto: DeleteCampaignDto,
  ): Promise<DeleteCampaignOutDto> {
    return this.campaignService.delete(deleteCampaignDto);
  }
}
