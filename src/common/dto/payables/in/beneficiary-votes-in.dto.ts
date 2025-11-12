import { SkipLimitDto } from '../../skip-limit.dto';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BeneficiaryVotesInDto extends SkipLimitDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  campaignId: string;
}
