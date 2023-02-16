import { ApiProperty } from '@nestjs/swagger';

export class ReservationCountOutDto {
  @ApiProperty({ type: Number })
  count: number;
}
