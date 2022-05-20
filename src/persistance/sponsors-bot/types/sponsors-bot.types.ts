import { Document } from 'mongoose';
import { SponsorsBot, VoteSponsor } from '../sponsors-bot.schema';

export type SponsorsBotDocumentType = SponsorsBot & Document;
export type VoteSponsorType = VoteSponsor;
