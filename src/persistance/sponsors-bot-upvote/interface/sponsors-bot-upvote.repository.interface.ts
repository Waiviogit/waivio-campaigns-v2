import {
  CreateUpvoteType,
  GetUpvoteType,
  SponsorsBotUpvoteDocumentType,
  UpdateStatusType,
} from '../type';

import { MongoRepositoryInterface } from '../../mongo.repository';

export interface SponsorsBotUpvoteRepositoryInterface
  extends MongoRepositoryInterface<SponsorsBotUpvoteDocumentType> {
  create(upvote: CreateUpvoteType): Promise<SponsorsBotUpvoteDocumentType>;
  getUpvotes(): Promise<GetUpvoteType[]>;
  updateStatus({
    _id,
    status,
    currentVote,
    voteWeight,
  }: UpdateStatusType): Promise<boolean>;
}
