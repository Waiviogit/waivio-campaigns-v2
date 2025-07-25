import { SponsorsBotDocumentType, VoteSponsorType } from './sponsors-bot.types';
import { FilterQuery, QueryOptions } from 'mongoose';

export type CreateSponsorBotType = {
  botName: string;
  sponsor: string;
  votingPercent: number;
  enabled: boolean;
  note: string;
  expiredAt: Date | null;
};

export type UpdateSponsorBotType = CreateSponsorBotType;

export type SetMatchBotType = CreateSponsorBotType;

export type RemoveSponsorBotRuleType = Pick<
  CreateSponsorBotType,
  'botName' | 'sponsor'
>;

export type SetSponsorsBotVotingPowerType = {
  botName: string;
  minVotingPower: number;
};

export type GetSponsorsBotType = {
  botName: string;
  skip?: number;
  limit: number;
};

export type GetRequestSponsorBotType = {
  results: UnwindSponsorsType[];
  votingPower: number | null;
};

export type UnwindSponsorsType = VoteSponsorType & {
  botName: string;
  minVotingPower: string;
};

export type UpdateSponsorsStatusType = {
  botName: string;
  enabled: boolean;
};

export type SponsorsBotFindType = {
  filter: FilterQuery<SponsorsBotDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
