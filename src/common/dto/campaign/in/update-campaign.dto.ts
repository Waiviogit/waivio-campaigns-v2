import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CampaignDto } from '../campaign.dto';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class UpdateCampaignDto extends PartialType(
  OmitType(CampaignDto, [
    'guideName',
    'status',
    'campaignServer',
    'users',
    'activationPermlink',
    'deactivationPermlink',
    // 'payments',
    'stoppedAt',
    'rewardInUSD',
    'createdAt',
  ]),
) {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  _id: ObjectId;
}
