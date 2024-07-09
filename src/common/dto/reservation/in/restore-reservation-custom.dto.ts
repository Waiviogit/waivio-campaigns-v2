import { IsNotEmpty, IsString } from 'class-validator';

export class RestoreReservationCustomDto {
  @IsNotEmpty()
  @IsString()
  parentPermlink: string;

  @IsNotEmpty()
  @IsString()
  guideName: string;

  @IsNotEmpty()
  @IsString()
  user: string;
}
