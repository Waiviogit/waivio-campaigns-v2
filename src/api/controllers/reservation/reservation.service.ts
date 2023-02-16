import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RESERVATION_PROVIDE } from '../../../common/constants';
import {
  AssignReservationInterface,
  GetReservationDetailsInterface,
  RejectReservationInterface,
  reservationCountInterface,
  ReservationDetailsInterface,
} from '../../../domain/campaign/reservation/interface';
import {
  RejectReservationType,
  ValidateAssignType,
} from '../../../domain/campaign/reservation/types';
import { CampaignCustomException } from '../../../common/exeptions';
import {
  GetReservationDetailsType,
  reservationCountType,
} from '../../../domain/campaign/reservation/types/reservation-details.types';

@Injectable()
export class ReservationService {
  constructor(
    @Inject(RESERVATION_PROVIDE.ASSIGN)
    private readonly assignReservation: AssignReservationInterface,
    @Inject(RESERVATION_PROVIDE.REJECT)
    private readonly rejectReservation: RejectReservationInterface,
    @Inject(RESERVATION_PROVIDE.DETAILS)
    private readonly reservationDetails: ReservationDetailsInterface,
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

  async getReservationDetails(
    params: GetReservationDetailsInterface,
  ): Promise<GetReservationDetailsType> {
    const details = await this.reservationDetails.getDetails(params);
    if (!details) {
      throw new CampaignCustomException(
        'Reservation not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return details;
  }

  async getReservationCount(
    params: reservationCountInterface,
  ): Promise<reservationCountType> {
    return this.reservationDetails.reservationCount(params);
  }
}
