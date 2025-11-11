import { Document } from 'mongoose';
import { BeneficiaryBotUpvote } from '../beneficiary-bot-upvote.schema';

export type BeneficiaryBotUpvoteDocumentType = BeneficiaryBotUpvote & Document;
