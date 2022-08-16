import { CampaignPaymentUserType } from '../../../../domain/campaign-payment/types';
import { ApiProperty } from '@nestjs/swagger';
import { CAMPAIGN_PAYMENT, PAYOUT_TOKEN } from '../../../constants';
import { CampaignPaymentBeneficiariesType } from '../../../../persistance/campaign-payment/types';

export class BeneficiariesDto {
  @ApiProperty({ type: String })
  account: string;
  @ApiProperty({ type: Number })
  weight: number;
}

class PayablesUserDto {
  @ApiProperty({ type: String })
  userName: string;

  @ApiProperty({ type: String })
  guideName: string;

  @ApiProperty({
    type: String,
    enum: Object.values(CAMPAIGN_PAYMENT),
  })
  type: string;

  @ApiProperty({ type: Number, required: true })
  amount: number;

  @ApiProperty({
    type: String,
    enum: Object.values(PAYOUT_TOKEN),
  })
  payoutToken: string;

  @ApiProperty({ type: () => [BeneficiariesDto] })
  beneficiaries?: CampaignPaymentBeneficiariesType;

  @ApiProperty({ type: String })
  campaignId?: string;

  @ApiProperty({ type: String })
  transactionId?: string;

  @ApiProperty({ type: Number })
  commission?: number;

  @ApiProperty({ type: String })
  app?: string;

  @ApiProperty({ type: String, default: null })
  withdraw?: string;

  @ApiProperty({ type: Boolean, default: false })
  isDemoAccount?: boolean;

  @ApiProperty({ type: String })
  memo?: string;

  @ApiProperty({ type: String })
  reviewPermlink?: string;

  @ApiProperty({ type: String })
  title?: string;
  //why?
  @ApiProperty({ type: String })
  parentAuthor?: string;

  @ApiProperty({ type: String })
  parentPermlink?: string;

  @ApiProperty({ type: String })
  reviewObject?: string;

  @ApiProperty({ type: String })
  mainObject?: string;

  createdAt: Date;
  @ApiProperty({ type: Number })
  balance: number;
}

export class GuidePayablesUserOutDto {
  @ApiProperty({ type: Number })
  totalPayable: number;
  @ApiProperty({ type: () => [PayablesUserDto] })
  histories: CampaignPaymentUserType[];
  @ApiProperty({ type: Number })
  notPayedPeriod: number;
}
