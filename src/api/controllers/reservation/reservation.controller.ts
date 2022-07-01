import { Body, Controller, Post } from '@nestjs/common';
import {
  ValidateCampaignAssignDto,
  ValidateCampaignRejectDto,
} from '../../../common/dto/campaign/in';
import { ValidationResponseDto } from '../../../common/dto/campaign/out';
import { ReservationService } from './reservation.service';
import { ReservationControllerDoc } from './reservation.controller.doc';

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
}
