import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PAYOUT_TOKEN } from '../../common/constants';
import { VoteSponsorType } from './types';

@Schema({ _id: false })
export class VoteSponsor {
  @Prop({ type: String, required: true })
  sponsor: string;

  @Prop({ type: Number, default: 1, min: 0.01, max: 1, required: true })
  votingPercent: number;

  @Prop({ type: String, maxlength: 256 })
  note: string;

  @Prop({ type: Boolean, default: false, required: true })
  enabled: boolean;

  @Prop({ type: Date, default: null })
  expiredAt: Date | null;
}
export const VoteSponsorSchema = SchemaFactory.createForClass(VoteSponsor);

@Schema()
export class SponsorsBot {
  @Prop({ type: String, required: true, unique: true })
  botName: string;

  @Prop({ type: String, enum: [PAYOUT_TOKEN.WAIV], default: PAYOUT_TOKEN.WAIV })
  symbol?: string;

  @Prop({ type: Number, default: 8000, min: 1, max: 10000, required: true })
  minVotingPower: number;

  @Prop({ type: [VoteSponsorSchema], default: [] })
  sponsors: VoteSponsorType[];
}

export const SponsorsBotSchema = SchemaFactory.createForClass(SponsorsBot);
