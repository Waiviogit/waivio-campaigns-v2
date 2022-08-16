import { CampaignPaymentDocumentType } from '../../../../persistance/campaign-payment/types';
import { ReservationDetailsObjectType } from '../../../../domain/campaign/reservation/types/reservation-details.types';
import { UserReportType } from '../../../../domain/campaign-payment/types';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationDetailsObjectDto } from '../../reservation/out';
import { CampaignPaymentDto } from '../campaign-payment.dto';

class UserReportDto {
  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Number })
  wobjects_weight: number;

  @ApiProperty({ type: String })
  alias: string;

  @ApiProperty({ type: String })
  json_metadata: string;
}

export class SingleReportOutDto {
  @ApiProperty({ type: UserReportDto })
  user: UserReportType;

  @ApiProperty({ type: UserReportDto })
  sponsor: UserReportType;

  @ApiProperty({ type: [CampaignPaymentDto] })
  histories: CampaignPaymentDocumentType[];

  @ApiProperty({ type: Number })
  rewardTokenAmount: number;

  @ApiProperty({ type: Number })
  rewardUsd: number;

  @ApiProperty({ type: ReservationDetailsObjectDto })
  requiredObject: ReservationDetailsObjectType;

  @ApiProperty({ type: ReservationDetailsObjectDto })
  secondaryObject: ReservationDetailsObjectType;

  @ApiProperty({ type: String })
  activationPermlink: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  reviewDate: string;

  @ApiProperty({ type: String })
  reservationDate: string;

  @ApiProperty({ type: String })
  createCampaignDate: string;

  @ApiProperty({ type: [String] })
  matchBots: string[];
}
