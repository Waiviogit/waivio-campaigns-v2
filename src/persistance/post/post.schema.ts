import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LANGUAGES } from '../../common/constants';
import {
  ActiveVotesType,
  BeneficiariesType,
  PostWobjects,
  ReblogToType,
} from './types';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Number, required: true })
  id: number;

  @Prop({ type: String, required: true })
  author: string;

  @Prop({ type: Number, default: 0 })
  author_reputation: number;

  @Prop({ type: Number, default: 0 })
  author_weight: number;

  @Prop({ type: String, required: true })
  permlink: string;

  @Prop({ type: String, default: '' })
  parent_author: string;

  @Prop({ type: String, default: '' })
  parent_permlink: string;

  @Prop({ type: String, default: '' })
  title: string;

  @Prop({ type: String, default: '' })
  body: string;

  @Prop({ type: String, default: '' })
  json_metadata: string;

  @Prop({ type: String })
  app: string;

  @Prop({ type: Number })
  depth: number;

  @Prop({ type: String })
  category: string;

  @Prop({ type: String })
  last_update: string;

  @Prop({ type: String })
  created: string;

  @Prop({ type: String })
  active: string;

  @Prop({ type: String })
  last_payout: string;

  @Prop({ type: Number, default: 0 })
  children: number;

  @Prop({ type: Number, default: 0 })
  net_rshares: number;

  @Prop({ type: Number, default: 0 })
  abs_rshares: number;

  @Prop({ type: Number, default: 0 })
  vote_rshares: number;

  @Prop({ type: Number })
  children_abs_rshares: number;

  @Prop({ type: String })
  cashout_time: string;

  @Prop({ type: String })
  reward_weight: string;

  @Prop({ type: String })
  total_payout_value: string;

  @Prop({ type: String })
  curator_payout_value: string;

  @Prop({ type: Number })
  author_rewards: number;

  @Prop({ type: Number })
  net_votes: number;

  @Prop({ type: String })
  root_author: string;

  @Prop({ type: String })
  root_permlink: string;

  @Prop({ type: String })
  root_title: string;

  @Prop({ type: String })
  max_accepted_payout: string;

  @Prop({ type: Number })
  percent_steem_dollars: number;

  @Prop({ type: Boolean })
  allow_replies: boolean;

  @Prop({ type: Boolean })
  allow_votes: boolean;

  @Prop({ type: Boolean })
  allow_curation_rewards: boolean;

  @Prop(
    raw({
      type: [
        {
          account: { type: String },
          weight: { type: Number },
        },
      ],
    }),
  )
  beneficiaries: BeneficiariesType;

  @Prop({ type: String })
  url: string;

  @Prop({ type: String })
  pending_payout_value: string;

  @Prop({ type: String })
  total_pending_payout_value: string;

  @Prop({ type: Number })
  total_vote_weight: number;

  @Prop({ type: String })
  promoted: string;

  @Prop({ type: Number })
  body_length: number;

  @Prop(
    raw({
      type: [
        {
          voter: { type: String },
          weight: { type: Number },
          percent: { type: Number },
        },
      ],
      default: [],
    }),
  )
  active_votes: ActiveVotesType[];

  @Prop(
    raw({
      type: [
        {
          author_permlink: { type: String, index: true },
          percent: { type: Number },
          tagged: { type: String },
        },
      ],
    }),
  )
  wobjects: PostWobjects[];

  @Prop({ type: String, default: LANGUAGES.en_US })
  language: string;

  @Prop(
    raw({
      type: {
        author: { type: String },
        permlink: { type: String },
      },
    }),
  )
  reblog_to: ReblogToType;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ author: 1, permlink: 1 }, { unique: true });
