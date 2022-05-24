import { CreateUpvoteType, SponsorsBotUpvoteDocumentType } from '../type';

export interface SponsorsBotUpvoteRepositoryInterface {
  create(upvote: CreateUpvoteType): Promise<SponsorsBotUpvoteDocumentType>;
}
