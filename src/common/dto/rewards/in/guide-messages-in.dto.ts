import { IsIn, IsOptional, IsString } from 'class-validator';
import { CONVERSATION_STATUS } from '../../../constants';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { GuideReservationsInDto } from './guide-reservations-in.dto';

export class GuideMessagesInDto extends OmitType(GuideReservationsInDto, [
  'campaignNames',
]) {
  @IsString()
  @IsIn(Object.values(CONVERSATION_STATUS))
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    enum: Object.values(CONVERSATION_STATUS),
  })
  caseStatus?: string = CONVERSATION_STATUS.ALL;
}
