import { Document } from 'mongoose';
import { GiveawayParticipants } from '../giveaway-participants.schema';

export type GiveawayParticipantsDocumentType = GiveawayParticipants & Document;


