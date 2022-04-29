import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import BigNumber from 'bignumber.js';
import { ObjectId, Types } from 'mongoose';

import { CAMPAIGN_PAYMENT, PAYOUT_TOKEN } from '../../common/constants';
import { CampaignPaymentBeneficiariesType } from './types';

@Schema({ versionKey: false })
export class CampaignPayment {
  @Prop({ type: String, required: true, index: true })
  userName: string;

  @Prop({ type: String, index: true })
  sponsor: string;

  @Prop({ type: String, enum: Object.values(CAMPAIGN_PAYMENT), required: true })
  type: string;

  @Prop({ type: Types.Decimal128, required: true })
  amount: BigNumber;

  @Prop({
    type: String,
    enum: Object.values(PAYOUT_TOKEN),
    required: true,
    index: true,
  })
  payoutToken: string;

  @Prop(
    raw([
      {
        account: { type: String },
        weight: { type: Number },
      },
    ]),
  )
  beneficiaries?: CampaignPaymentBeneficiariesType;

  @Prop({ type: Types.ObjectId })
  campaignId?: ObjectId;

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ type: Types.Decimal128 })
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
}

export const CampaignPaymentSchema =
  SchemaFactory.createForClass(CampaignPayment);
