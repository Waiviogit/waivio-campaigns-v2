import { ApiProperty } from '@nestjs/swagger';
import { BeneficiaryBotUpvoteDto } from './beneficiary-bot-upvote.dto';
import { BeneficiaryUpvoteReport } from 'src/domain/campaign-payment/types/payment-report.types';

export class BeneficiaryVotesOutDto {
  @ApiProperty({ type: () => [BeneficiaryBotUpvoteDto] })
  result: BeneficiaryUpvoteReport[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
