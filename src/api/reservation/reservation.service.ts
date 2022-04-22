import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RESERVATION_PROVIDE } from '../../common/constants';
import {
  AssignReservationInterface,
  RejectReservationInterface,
} from '../../domain/campaign/reservation/interface';
import {
  RejectReservationType,
  ValidateAssignType,
} from '../../domain/campaign/reservation/types';
import { CampaignCustomException } from '../../common/exeptions';

@Injectable()
export class ReservationService {
  constructor(
    @Inject(RESERVATION_PROVIDE.ASSIGN)
    private readonly assignReservation: AssignReservationInterface,
    @Inject(RESERVATION_PROVIDE.REJECT)
    private readonly rejectReservation: RejectReservationInterface,
  ) {}
  async validateAssign(
    params: ValidateAssignType,
  ): Promise<{ isValid: boolean }> {
    const { isValid, message } = await this.assignReservation.validateAssign(
      params,
    );
    if (!isValid) {
      throw new CampaignCustomException(
        message,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return { isValid };
  }

  async validateReject(
    params: RejectReservationType,
  ): Promise<{ isValid: boolean }> {
    const { isValid, message } =
      await this.rejectReservation.validateRejectAssign(params);
    if (!isValid) {
      throw new CampaignCustomException(
        message,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return { isValid };
  }
}
