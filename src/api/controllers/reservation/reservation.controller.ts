import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ValidateCampaignAssignDto,
  ValidateCampaignRejectDto,
} from '../../../common/dto/campaign/in';
import { ValidationResponseDto } from '../../../common/dto/campaign/out';
import { ReservationService } from './reservation.service';
import { ReservationControllerDoc } from './reservation.controller.doc';
import { CustomHeaders } from '../../../common/decorators';
import { HostPipe } from '../../pipes/host.pipe';
import { ReservationDetailsOutDto } from '../../../common/dto/reservation/out';

@Controller('reservation')
@ReservationControllerDoc.main()
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('assign')
  @ReservationControllerDoc.getValidateAssign()
  async validateAssign(
    @Body() params: ValidateCampaignAssignDto,
  ): Promise<ValidationResponseDto> {
    return this.reservationService.validateAssign(params);
  }

  @Post('reject')
  @ReservationControllerDoc.getValidateReject()
  async validateReject(
    @Body() params: ValidateCampaignRejectDto,
  ): Promise<ValidationResponseDto> {
    return this.reservationService.validateReject(params);
  }

  @Get('details/:userName/:campaignId')
  @ReservationControllerDoc.getReservationDetails()
  async getReservationDetails(
    @Param('userName')
    userName: string,
    @Param('campaignId')
    campaignId: string,
    @CustomHeaders(new HostPipe())
    host: string,
  ): Promise<ReservationDetailsOutDto> {
    return this.reservationService.getReservationDetails({
      userName,
      campaignId,
      host,
    });
  }
}
