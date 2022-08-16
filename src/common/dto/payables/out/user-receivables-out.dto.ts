import { ApiProperty, OmitType } from '@nestjs/swagger';
import { PayablesAllDto } from './guide-payables-out.dto';
import { UserReceivablesType } from '../../../../domain/campaign-payment/types/user-payments.query.types';

class ReceivablesAllDto extends OmitType(PayablesAllDto, ['userName']) {
  @ApiProperty({ type: String })
  guideName: string;
}

export class UserReceivablesOutDto {
  @ApiProperty({ type: [ReceivablesAllDto] })
  histories: UserReceivablesType[];

  @ApiProperty({ type: Number })
  totalPayable: number;

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
