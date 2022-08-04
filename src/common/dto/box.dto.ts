import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class BoxDto {
  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  bottomPoint: [number, number];

  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  topPoint: [number, number];
}
