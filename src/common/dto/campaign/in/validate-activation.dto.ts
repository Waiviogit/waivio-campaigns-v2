import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateActivationDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  _id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  guideName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  permlink: string;
}
