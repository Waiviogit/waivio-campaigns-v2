import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PayablesInDto } from './payables-in.dto';

export class SingleReportInDto extends PayablesInDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  userName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  guideName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  reviewPermlink: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  reservationPermlink: string;
}
