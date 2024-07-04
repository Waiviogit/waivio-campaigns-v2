import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { CAMPAIGN_PAYMENT, PAYOUT_TOKEN } from '../../common/constants';
import { CampaignPaymentBeneficiariesType } from './types';
import BigNumber from 'bignumber.js';

@Schema({ _id: false })
class Beneficiaries {
  @Prop({ type: String })
  account: string;

  @Prop({ type: Number })
  weight: number;
}

const BeneficiariesSchema = SchemaFactory.createForClass(Beneficiaries);

@Schema({ versionKey: false, timestamps: true })
export class CampaignPayment {
  _id: mongoose.ObjectId;

  @Prop({ type: String, required: true, index: true })
  userName: string;

  @Prop({ type: String, index: true })
  guideName: string;

  @Prop({ type: String, enum: Object.values(CAMPAIGN_PAYMENT), required: true })
  type: string;

  @Prop({ type: mongoose.Schema.Types.Decimal128, required: true })
  amount: BigNumber;

  @Prop({ type: mongoose.Schema.Types.Decimal128, default: 0 })
  votesAmount?: BigNumber;

  @Prop({
    type: String,
    enum: Object.values(PAYOUT_TOKEN),
    required: true,
    index: true,
  })
  payoutToken: string;

  @Prop({ type: [BeneficiariesSchema] })
  beneficiaries?: CampaignPaymentBeneficiariesType[];

  @Prop({ type: mongoose.Types.ObjectId })
  campaignId?: mongoose.ObjectId;

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ type: mongoose.Schema.Types.Decimal128 })
  commission?: BigNumber;

  @Prop({ type: String })
  app?: string;

  @Prop({ type: String, default: null })
  withdraw?: string;

  @Prop({ type: Boolean, default: false })
  isDemoAccount?: boolean;

  @Prop({ type: String })
  memo?: string;

  @Prop({ type: String })
  reviewPermlink?: string;

  @Prop({ type: String })
  reservationPermlink?: string;

  @Prop({ type: String })
  title?: string;
  //why?
  @Prop({ type: String })
  parentAuthor?: string;

  @Prop({ type: String })
  parentPermlink?: string;
  //
  @Prop({ type: String })
  reviewObject?: string;

  @Prop({ type: String })
  mainObject?: string;

  @Prop({ type: String })
  campaignType?: string;

  createdAt: Date;
  //For all types except transfers
  @Prop({ type: Number })
  payoutTokenRateUSD?: number;
}

export const CampaignPaymentSchema =
  SchemaFactory.createForClass(CampaignPayment);
