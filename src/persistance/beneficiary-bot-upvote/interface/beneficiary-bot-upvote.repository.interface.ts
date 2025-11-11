import { MongoRepositoryInterface } from '../../mongo.repository';
import {
  CreateBeneficiaryUpvoteType,
  GetBeneficiaryUpvoteType,
  UpdateBeneficiaryStatusType,
} from '../type/beneficiary-bot-upvote.repository.types';
import { BeneficiaryBotUpvoteDocumentType } from '../type/beneficiary-bot-upvote.types';

export interface BeneficiaryBotUpvoteRepositoryInterface
  extends MongoRepositoryInterface<
    BeneficiaryBotUpvoteDocumentType,
    CreateBeneficiaryUpvoteType
  > {
  create(
    upvote: CreateBeneficiaryUpvoteType,
  ): Promise<BeneficiaryBotUpvoteDocumentType>;
  getUpvotes(): Promise<GetBeneficiaryUpvoteType[]>;
  updateStatus({
    _id,
    status,
    currentVote,
    voteWeight,
  }: UpdateBeneficiaryStatusType): Promise<boolean>;
  calcVotesOnEvent(
    activationPermlink: string,
    eventDate: Date,
  ): Promise<number>;
}
