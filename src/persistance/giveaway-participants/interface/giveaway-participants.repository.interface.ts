import {
  GiveawayParticipantsDocumentType,
  GiveawayParticipantsFindType,
} from '../types';

export interface GiveawayParticipantsRepositoryInterface {
  find({
    filter,
    projection,
    options,
  }: GiveawayParticipantsFindType): Promise<GiveawayParticipantsDocumentType[]>;
}
