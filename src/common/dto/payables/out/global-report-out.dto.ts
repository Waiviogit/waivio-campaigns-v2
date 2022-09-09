import { GlobalPaymentType } from '../../../../domain/campaign-payment/types';
import { ApiProperty } from '@nestjs/swagger';
import { PayablesUserDto } from './guide-payables-user-out.dto';

export class GlobalReportOutDto {
  @ApiProperty({ type: () => [PayablesUserDto] })
  histories: GlobalPaymentType[];
  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
