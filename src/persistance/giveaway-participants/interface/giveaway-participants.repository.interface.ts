import { GiveawayParticipantsDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export interface GetGiveawayMessageInterface {
  guideLink: string;
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

export interface GiveawayParticipantsRepositoryInterface
  extends MongoRepositoryInterface<GiveawayParticipantsDocumentType> {
  insertMany(
    docs: { userName: string; activationPermlink: string; eventId?: string }[],
  ): Promise<void>;
  getByNamesByActivationPermlink(activationPermlink: string): Promise<string[]>;
  getByNamesByActivationPermlinkEventId(
    activationPermlink: string,
    eventId: string,
  ): Promise<string[]>;
}
