import { ObjectId, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class AuthorityDto {
  @ApiProperty({ type: [String], default: [] })
  administrative: string[];

  @ApiProperty({ type: [String], default: [] })
  ownership: string[];
}

export class FieldActiveVotesDto {
  @ApiProperty({ type: String })
  voter: string;

  @ApiProperty({ type: Number })
  weight: number;

  @ApiProperty({ type: Number })
  percent: number;

  @ApiProperty({ type: Number })
  rshares_weight: number;
}

export class WobjectFieldsDto {
  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  body: string;

  @ApiProperty({ type: Number, default: 1 })
  weight: number;

  @ApiProperty({ type: String, default: 'en-US' })
  locale: string;

  @ApiProperty({ type: String })
  creator: string;

  @ApiProperty({ type: String })
  author: string;

  @ApiProperty({ type: String })
  permlink: string;

  @ApiProperty({ type: () => [FieldActiveVotesDto], default: [] })
  active_votes: FieldActiveVotesDto[];
}

export class WobjectMapDto {
  @ApiProperty({ type: String, enum: ['Point'] })
  type: string;

  @ApiProperty({ type: [Number] })
  coordinates: number;
}

export class WobjectDto {
  _id: ObjectId;

  @ApiProperty({ type: String })
  app: string;

  @ApiProperty({ type: String })
  community: string;

  @ApiProperty({ type: String })
  object_type: string;

  @ApiProperty({ type: String, required: true })
  default_name: string;

  @ApiProperty({ type: Boolean, default: true })
  is_posting_open: boolean;

  @ApiProperty({ type: Boolean, default: true })
  is_extending_open: boolean;

  @ApiProperty({ type: String, required: true })
  creator: string;

  @ApiProperty({ type: String, required: true })
  author: string;

  @ApiProperty({ type: () => AuthorityDto })
  authority: AuthorityDto;

  @ApiProperty({ type: String })
  author_permlink: string;

  @ApiProperty({ type: Number })
  weight: number;

  @ApiProperty({ type: String })
  parent: string;

  @ApiProperty({ type: [String], default: [] })
  children: string[];

  @ApiProperty({ type: () => [WobjectFieldsDto], default: [] })
  fields: WobjectFieldsDto[];

  @ApiProperty({ type: () => WobjectMapDto })
  map?: WobjectMapDto;

  @ApiProperty({ type: [Types.ObjectId] })
  activeCampaigns: ObjectId[];

  @ApiProperty({ type: Number, default: 0 })
  activeCampaignsCount: number;
}
