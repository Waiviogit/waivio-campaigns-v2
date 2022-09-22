import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserFollowingsInDto {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  users: string[];

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  objects: string[];
}
