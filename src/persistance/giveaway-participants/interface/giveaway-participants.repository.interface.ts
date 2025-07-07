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
  insertMany(
    docs: { userName: string; activationPermlink: string }[],
  ): Promise<void>;
  getByNamesByActivationPermlink(activationPermlink: string): Promise<string[]>;
}
