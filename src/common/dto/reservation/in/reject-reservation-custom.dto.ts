import { IsNotEmpty, IsString } from 'class-validator';

export class RejectReservationCustomDto {
  @IsNotEmpty()
  @IsString()
  reservationPermlink: string;

  @IsNotEmpty()
  @IsString()
  guideName: string;

  @IsNotEmpty()
  @IsString()
  rejectionPermlink: string;
}
