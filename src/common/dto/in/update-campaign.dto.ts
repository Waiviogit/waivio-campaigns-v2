import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CampaignDto } from '../campaign.dto';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UpdateCampaignDto extends PartialType(
  OmitType(CampaignDto, ['guideName'] as const),
) {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  _id: string;
}
