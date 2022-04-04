import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class ActivateCampaignDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsString()
  guideName: string;

  @IsNotEmpty()
  @IsString()
  permlink: string;
}
