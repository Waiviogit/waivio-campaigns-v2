import {
  GetRequestSponsorBotType,
  GetSponsorsBotType,
  RemoveSponsorBotRuleType,
  SetMatchBotType,
  SetSponsorsBotVotingPowerType,
  SponsorsBotDocumentType,
  SponsorsBotFindType,
  UpdateSponsorsStatusType,
} from '../types';

export interface SponsorsBotRepositoryInterface {
  setSponsorsBot(data: SetMatchBotType): Promise<boolean>;
  removeRule({ botName, sponsor }: RemoveSponsorBotRuleType): Promise<boolean>;
  getSponsorsBot({
    botName,
    skip,
    limit,
  }: GetSponsorsBotType): Promise<GetRequestSponsorBotType>;
  setVotingPower({
    botName,
    minVotingPower,
  }: SetSponsorsBotVotingPowerType): Promise<boolean>;
  updateStatus({
    botName,
    enabled,
  }: UpdateSponsorsStatusType): Promise<boolean>;
  inactivateRules(): Promise<void>;
  findOne({
    filter,
    projection,
    options,
  }: SponsorsBotFindType): Promise<SponsorsBotDocumentType>;
  find({
    filter,
    projection,
    options,
  }: SponsorsBotFindType): Promise<SponsorsBotDocumentType[]>;
}
