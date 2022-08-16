import mongoose from 'mongoose';
import { CAMPAIGN_PAYMENT, PAYOUT_TOKEN } from '../../constants';
import BigNumber from 'bignumber.js';
import { CampaignPaymentBeneficiariesType } from '../../../persistance/campaign-payment/types';
import { ApiProperty } from '@nestjs/swagger';
import { BeneficiariesDto } from './out';

export class CampaignPaymentDto {
  @ApiProperty({ type: String, required: true })
  userName: string;

  @ApiProperty({ type: String })
  guideName: string;

  @ApiProperty({ type: String, enum: Object.values(CAMPAIGN_PAYMENT) })
  type: string;

  @ApiProperty({ type: Number })
  amount: BigNumber;

  @ApiProperty({ type: Number })
  votesAmount?: BigNumber;

  @ApiProperty({
    type: String,
    enum: Object.values(PAYOUT_TOKEN),
  })
  payoutToken: string;

  @ApiProperty({ type: [BeneficiariesDto] })
  beneficiaries?: CampaignPaymentBeneficiariesType[];

  @ApiProperty({ type: String })
  campaignId?: mongoose.ObjectId;

  @ApiProperty({ type: String })
  transactionId?: string;

  @ApiProperty({ type: Number })
  commission?: BigNumber;

  @ApiProperty({ type: String })
  app?: string;

  @ApiProperty({ type: String })
  withdraw?: string;

  @ApiProperty({ type: Boolean })
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
  //
  @ApiProperty({ type: String })
  reviewObject?: string;

  @ApiProperty({ type: String })
  mainObject?: string;

  @ApiProperty({ type: String })
  createdAt: Date;
}
