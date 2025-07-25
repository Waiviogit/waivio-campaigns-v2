import {
  GiveawayParticipantsDocumentType,
  GiveawayParticipantsFindType,
} from '../types';

export interface GetGiveawayMessageInterface {
  guideName: string;
  sponsorName: string;
  payoutToken: string;
  legalAgreement: string;
  rewardInUSD: number;
  rewardInToken: number;
  participants: string[];
  winners: string[];
}

export interface GetGiveawayPersonalMessageInterface
  extends Omit<GetGiveawayMessageInterface, 'winners' | 'participants'> {
  userName: string;
}

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
  getByNamesByActivationPermlinkEventId(
    activationPermlink: string,
    eventId: string,
  ): Promise<string[]>;
}
