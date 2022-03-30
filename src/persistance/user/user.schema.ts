import { Schema, Prop, raw, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';

import {
  LANGUAGES,
  REFERRAL_STATUSES,
  REFERRAL_TYPES,
  REWARD_SETTINGS,
  SUPPORTED_CURRENCY,
} from '../../common/constants';
import {AuthType, UserDraftType, UserMetadataSettingsType} from './types';
import { Document } from 'mongoose';

@Schema({ _id: false })
class Referral {
  @Prop({ type: String, index: true })
  agent: string;

  @Prop({ type: Date })
  startedAt: Date;

  @Prop({ type: Date })
  endedAt: Date;

  @Prop({ type: String, enum: Object.values(REFERRAL_TYPES) })
  type: string;
}
export const ReferralSchema = SchemaFactory.createForClass(Referral);
export type ReferralDocumentType = Referral & Document;

@Schema({ _id: false })
class UserMetadata {
  @Prop({ type: Number, default: 0 })
  notifications_last_timestamp: number;

  @Prop(
    raw({
      exitPageSetting: { type: Boolean, default: false },
      locale: {
        type: String,
        enum: Object.values(LANGUAGES),
        default: LANGUAGES.AUTO,
      },
      postLocales: {
        type: [{ type: String, enum: Object.values(LANGUAGES) }],
        default: [],
      },
      nightmode: { type: Boolean, default: false },
      rewardSetting: {
        type: String,
        enum: Object.values(REWARD_SETTINGS),
        default: REWARD_SETTINGS.FIFTY_FIFTY,
      },
      rewriteLinks: { type: Boolean, default: false },
      showNSFWPosts: { type: Boolean, default: false },
      upvoteSetting: { type: Boolean, default: false },
      hiveBeneficiaryAccount: { type: String, default: '' },
      votePercent: { type: Number, min: 1, max: 10000, default: 5000 },
      votingPower: { type: Boolean, default: false },
    }),
  )
  settings: UserMetadataSettingsType;

  @Prop({
    type: String,
    enum: Object.values(SUPPORTED_CURRENCY),
    default: SUPPORTED_CURRENCY.USD,
  })
  currency: string;

  @Prop({ type: [String], default: [] })
  bookmarks: string[];

  @Prop({
    type: [
      {
        title: { type: String },
        draftId: { type: String },
        author: { type: String },
        beneficiary: { type: Boolean, default: true },
        upvote: { type: Boolean },
        isUpdating: { type: Boolean },
        body: { type: String },
        originalBody: { type: String },
        jsonMetadata: { type: Object },
        lastUpdated: { type: Number },
        parentAuthor: { type: String },
        parentPermlink: { type: String },
        permlink: { type: String },
        reward: { type: String },
      },
    ],
    default: [],
  })
  drafts: UserDraftType[];

  @Prop({ type: Boolean, default: true })
  new_user: boolean;
}
export const UserMetadataSchema = SchemaFactory.createForClass(UserMetadata);
export type UserMetadataDocumentType = UserMetadata & Document;

@Schema({ timestamps: true })
export class User {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({ type: String, index: true, unique: true })
  name: string;

  @Prop({ type: String })
  alias: string;

  @Prop(
    raw({
      id: { type: String },
      provider: { type: String },
    }),
  )
  auth: AuthType;

  @Prop({ type: String })
  profile_image: string;

  @Prop({ type: [String], default: [] })
  read_locales: string[];

  @Prop({ type: [String], default: [] })
  objects_follow: string[];

  @Prop({ type: [String], default: [] })
  users_follow: string[];

  @Prop({ type: String, default: '' })
  json_metadata: string;

  @Prop({ type: Number, default: 0, index: true })
  count_posts: number;

  @Prop({ type: Number, default: 0 })
  followers_count: number;

  @Prop({ type: Number, default: 0 })
  users_following_count: number;

  @Prop({ type: UserMetadataSchema, default: () => ({}) })
  user_metadata: UserMetadataDocumentType;

  @Prop({ type: Number, default: 0 })
  wobjects_weight: number;

  @Prop({ type: Object, default: [] })
  app_settings: unknown;

  @Prop({ type: String, default: null, select: false })
  privateEmail: string;

  @Prop({
    type: String,
    enum: Object.values(REFERRAL_STATUSES),
    default: REFERRAL_STATUSES.NOT_ACTIVATED,
  })
  referralStatus: string;

  @Prop({ type: [ReferralSchema], default: [] })
  referral: ReferralDocumentType[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocumentType = User & Document;
