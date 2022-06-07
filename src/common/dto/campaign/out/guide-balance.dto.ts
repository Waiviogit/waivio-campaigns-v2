import { ApiProperty } from '@nestjs/swagger';

export class GuideBalanceDto {
  @ApiProperty({ type: Number })
  balance: number;

  @ApiProperty({ type: Number })
  payable: number;

  @ApiProperty({ type: Number })
  reserved: number;

  @ApiProperty({ type: Number })
  remaining: number;
}
