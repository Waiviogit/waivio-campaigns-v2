import { ApiProperty } from '@nestjs/swagger';
import { BeneficiaryBotUpvoteDto } from './beneficiary-bot-upvote.dto';
import { BeneficiaryBotUpvoteDocumentType } from '../../../../persistance/beneficiary-bot-upvote/type/beneficiary-bot-upvote.types';

export class BeneficiaryVotesOutDto {
  @ApiProperty({ type: () => [BeneficiaryBotUpvoteDto] })
  result: BeneficiaryBotUpvoteDocumentType[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
