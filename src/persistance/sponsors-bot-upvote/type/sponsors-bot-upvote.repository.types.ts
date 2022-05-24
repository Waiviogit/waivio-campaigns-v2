import { SponsorsBotUpvote } from '../sponsors-bot-upvote.schema';

export type CreateUpvoteType = Omit<
  SponsorsBotUpvote,
  'startedAt' | 'expiredAt'
>;
