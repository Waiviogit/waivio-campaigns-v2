import { ApiProperty } from '@nestjs/swagger';
import { BeneficiaryBotUpvoteDocumentType } from '../../../../persistance/beneficiary-bot-upvote/type/beneficiary-bot-upvote.types';

export class BeneficiaryVotesOutDto {
  @ApiProperty({ type: () => [Object] })
  result: BeneficiaryBotUpvoteDocumentType[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
