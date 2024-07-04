import {
  Controller,
  Post,
  Body,
  Patch,
  UseGuards,
  Delete,
  Get,
  Param,
} from '@nestjs/common';
import { CampaignControllerDocs } from './campaign.controller.doc';
import {
  CreateCampaignDto,
  DeleteCampaignDto,
  UpdateCampaignDto,
  ValidateActivationDto,
  ValidateDeactivationDto,
} from '../../../common/dto/campaign/in';
import { CampaignService } from './campaign.service';

import { AuthGuard, ChangeCampaignGuard } from '../../guards';
import {
  CampaignReservationDetailsDto,
  CreateCampaignOutDto,
  DeleteCampaignOutDto,
  UpdateCampaignOutDto,
  ValidationResponseDto,
} from '../../../common/dto/campaign/out';
import { CampaignDto } from '../../../common/dto/campaign/campaign.dto';
import { CustomHeaders } from '../../../common/decorators';
import { HostPipe } from '../../pipes/host.pipe';

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

  @Get(':_id')
  @CampaignControllerDocs.getById()
  async getCampaignById(@Param('_id') _id: string): Promise<CampaignDto> {
    return this.campaignService.getCampaignById(_id);
  }

  @Post('activate')
  @CampaignControllerDocs.validateActivation()
  async validateActivation(
    @Body() params: ValidateActivationDto,
  ): Promise<ValidationResponseDto> {
    return this.campaignService.validateActivation(params);
  }

  @Post('deactivate')
  @CampaignControllerDocs.validateDeactivation()
  async validateDeactivation(
    @Body() params: ValidateDeactivationDto,
  ): Promise<ValidationResponseDto> {
    return this.campaignService.validateDeactivation(params);
  }

  @Get('details/:campaignId/:object')
  @CampaignControllerDocs.getCampaignDetails()
  async getCampaignReservationDetails(
    @CustomHeaders(new HostPipe())
    host: string,
    @Param('campaignId') campaignId: string,
    @Param('object') object: string,
  ): Promise<CampaignReservationDetailsDto> {
    return this.campaignService.getCampaignReservationDetails({
      campaignId,
      host,
      object,
    });
  }
}
