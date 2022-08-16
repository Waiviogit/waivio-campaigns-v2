import { PayablesAllType } from '../../../../domain/campaign-payment/types';
import { ApiProperty } from '@nestjs/swagger';

export class PayablesAllDto {
  @ApiProperty({ type: String })
  userName: string;

  @ApiProperty({ type: Number })
  payable: number;

  @ApiProperty({ type: String })
  alias: string;

  @ApiProperty({ type: String })
  notPayedDate: string;

  @ApiProperty({ type: Number, required: false })
  notPayedPeriod?: number;
}

export class GuidePayablesOutDto {
  @ApiProperty({ type: () => [PayablesAllDto] })
  histories: PayablesAllType[];

  @ApiProperty({ type: Number })
  totalPayable: number;

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
