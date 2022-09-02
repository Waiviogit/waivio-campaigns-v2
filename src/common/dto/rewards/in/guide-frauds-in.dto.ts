import { OmitType } from '@nestjs/swagger';
import { GuideReservationsInDto } from './guide-reservations-in.dto';

export class GuideFraudsInDto extends OmitType(GuideReservationsInDto, [
  'campaignNames',
  'statuses',
]) {}
