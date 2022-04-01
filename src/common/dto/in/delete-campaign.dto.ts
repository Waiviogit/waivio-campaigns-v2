import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteCampaignDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  _id: string;
}
