import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PAYOUT_TOKEN } from '../../../constants';

export class PayablesInDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  payoutToken: string = PAYOUT_TOKEN.WAIV;
}
