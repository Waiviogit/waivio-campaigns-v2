import { SkipLimitDto } from '../../skip-limit.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PAYOUT_TOKEN } from '../../../constants';

export class SponsorsBotInDto extends SkipLimitDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  symbol: string = PAYOUT_TOKEN.WAIV;

  @IsString()
  @ApiProperty({ type: String })
  botName: string;
}
