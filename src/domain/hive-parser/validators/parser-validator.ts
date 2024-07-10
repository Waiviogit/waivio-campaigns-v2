import { validate, ValidatorOptions } from 'class-validator';
import * as _ from 'lodash';
import { ActivateCampaignDto } from '../../../common/dto/campaign/in';
import { RejectReservationCustomDto } from '../../../common/dto/reservation/in/reject-reservation-custom.dto';
import { RestoreReservationCustomDto } from '../../../common/dto/reservation/in/restore-reservation-custom.dto';

class ParserValidator {
  async validateCampaignRejectCustom(
    guideName: string,
    reservationPermlink: string,
    rejectionPermlink: string,
  ): Promise<object> {
    const dto = new RejectReservationCustomDto();
    dto.guideName = guideName;
    dto.reservationPermlink = reservationPermlink;
    dto.rejectionPermlink = rejectionPermlink;
    return this.validateParams(dto);
  }

  async validateCampaignRestoreCustom(
    guideName: string,
    parentPermlink: string,
    user: string,
  ): Promise<object> {
    const dto = new RestoreReservationCustomDto();
    dto.guideName = guideName;
    dto.parentPermlink = parentPermlink;
    dto.user = user;
    return this.validateParams(dto);
  }

  async validateCampaignActivation(
    _id: string,
    guideName: string,
    permlink: string,
  ): Promise<object> {
    const activateCampaignDto = new ActivateCampaignDto();
    activateCampaignDto._id = _id;
    activateCampaignDto.guideName = guideName;
    activateCampaignDto.permlink = permlink;
    return this.validateParams(activateCampaignDto);
  }

  private async validateParams(
    dto: object,
    options?: ValidatorOptions,
  ): Promise<object> {
    const errors = await validate(dto, options);
    //TODO send notification to telegram
    if (_.isEmpty(errors)) return dto;
  }
}

export const parserValidator = new ParserValidator();
