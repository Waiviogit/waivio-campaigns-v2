import {
  CreateSponsorBotType,
  GetRequestSponsorBotType,
  GetSponsorsBotType,
  RemoveSponsorBotRuleType,
  SetMatchBotType,
  SetSponsorsBotVotingPowerType,
  SponsorsBotDocumentType,
  SponsorsBotFindType,
  UpdateSponsorsStatusType,
} from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export interface SponsorsBotRepositoryInterface {
  create({
    botName,
    sponsor,
    votingPercent,
    enabled,
    note,
    expiredAt,
  }: CreateSponsorBotType): Promise<boolean>;
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
