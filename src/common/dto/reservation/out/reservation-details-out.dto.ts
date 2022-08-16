import {
  ReviewRequirementsType,
  UserRequirementsType,
} from '../../../../persistance/campaign/types';
import { ReservationDetailsObjectType } from '../../../../domain/campaign/reservation/types/reservation-details.types';
import { ApiProperty } from '@nestjs/swagger';
import {
  RequirementsDto,
  UserRequirementsDto,
} from '../../campaign/campaign.dto';

export class ReservationDetailsObjectDto {
  @ApiProperty({ type: String })
  default_name: string;

  @ApiProperty({ type: String })
  author_permlink: string;

  @ApiProperty({ type: String })
  name: string;
}

export class ReservationDetailsOutDto {
  @ApiProperty({ type: String })
  _id: string;

  @ApiProperty({ type: ReservationDetailsObjectDto })
  requiredObject: ReservationDetailsObjectType;

  @ApiProperty({ type: ReservationDetailsObjectDto })
  secondaryObject: ReservationDetailsObjectType;

  @ApiProperty({ type: String })
  app: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  guideName: string;

  @ApiProperty({ type: RequirementsDto })
  requirements: ReviewRequirementsType;

  @ApiProperty({ type: UserRequirementsDto })
  userRequirements: UserRequirementsType;

  @ApiProperty({ type: String })
  reservationPermlink: string;
}
