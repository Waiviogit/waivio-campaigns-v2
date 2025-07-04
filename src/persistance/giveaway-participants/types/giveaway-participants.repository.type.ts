import { FilterQuery, QueryOptions } from 'mongoose';
import { GiveawayParticipantsDocumentType } from './giveaway-participants.types';

export type GiveawayParticipantsFindType = {
  filter: FilterQuery<GiveawayParticipantsDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
