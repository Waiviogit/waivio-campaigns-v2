import { Document } from 'mongoose';
import { SponsorsBotUpvote } from '../sponsors-bot-upvote.schema';

export type SponsorsBotUpvoteDocumentType = SponsorsBotUpvote & Document;
