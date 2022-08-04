import { SkipLimitDto } from '../../skip-limit.dto';
import { BoxType } from '../../../../domain/campaign/rewards/types';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BoxDto } from '../../box.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RewardsMapInDto extends SkipLimitDto {
  @ValidateNested()
  @Type(() => BoxDto)
  @ApiProperty({ type: () => BoxDto })
  box: BoxType;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  userName: string;
}
