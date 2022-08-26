import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import * as _ from 'lodash';

import {
  CreateSponsorBotType,
  GetRequestSponsorBotType,
  GetSponsorsBotType,
  RemoveSponsorBotRuleType,
  SetMatchBotType,
  SetSponsorsBotVotingPowerType,
  SponsorsBotDocumentType,
  SponsorsBotFindType,
  UpdateSponsorBotType,
  UpdateSponsorsStatusType,
} from './types';

import { SponsorsBot } from './sponsors-bot.schema';
import { SponsorsBotRepositoryInterface } from './interface';

@Injectable()
export class SponsorsBotRepository implements SponsorsBotRepositoryInterface {
  private readonly logger = new Logger(SponsorsBotRepository.name);
  constructor(
    @InjectModel(SponsorsBot.name)
    private readonly model: Model<SponsorsBotDocumentType>,
  ) {}

  async create({
    botName,
    sponsor,
    votingPercent,
    enabled,
    note,
    expiredAt,
  }: CreateSponsorBotType): Promise<boolean> {
    try {
      const result = await this.model.updateOne(
        { botName },
        {
          $push: {
            sponsors: {
              sponsor,
              votingPercent,
              enabled,
              note,
              expiredAt,
            },
          },
        },
        { upsert: true, setDefaultsOnInsert: true, runValidators: true },
      );

      return !!result;
    } catch (error) {
      this.logger.error(error.message);
      return false;
    }
  }

  async update({
    botName,
    enabled,
    sponsor,
    votingPercent,
    note,
    expiredAt,
  }: UpdateSponsorBotType): Promise<boolean> {
    if (enabled) {
      const matchBot = await this.model.findOne({ botName }).lean();
      if (!matchBot) return false;

      const findSponsor = _.find(
        matchBot.sponsors,
        (record) => record.sponsor_name === sponsor,
      );

      if (
        findSponsor.expiredAt &&
        findSponsor.expiredAt < moment().utc().toDate()
      ) {
        return false;
      }
    }
    try {
      const result = await this.model.updateOne(
        { botName, 'sponsors.sponsor': sponsor },
        {
          $set: {
            'sponsors.$': _.omitBy(
              {
                sponsor,
                enabled,
                votingPercent,
                note,
                expiredAt,
              },
              _.isNil,
            ),
          },
        },
        { runValidators: true, setDefaultsOnInsert: true },
      );

      return !!result;
    } catch (error) {
      this.logger.error(error.message);
      return false;
    }
  }

  async setSponsorsBot(data: SetMatchBotType): Promise<boolean> {
    const findMatchBot = await this.model.findOne({
      botName: data.botName,
      'sponsors.sponsor': data.sponsor,
    });

    if (findMatchBot) return this.update(data);
    return this.create(data);
  }

  async removeRule({
    botName,
    sponsor,
  }: RemoveSponsorBotRuleType): Promise<boolean> {
    try {
      const result = await this.model.updateOne(
        { botName },
        { $pull: { sponsors: { sponsor: sponsor } } },
      );

      return !!result.modifiedCount;
    } catch (error) {
      this.logger.error(error.message);
      return false;
    }
  }

  async getSponsorsBot({
    botName,
    skip,
    limit,
  }: GetSponsorsBotType): Promise<GetRequestSponsorBotType> {
    try {
      const matchBot = await this.model.findOne(
        { botName },
        { sponsors: { $slice: [skip, limit] } },
      );
      const mappedData = _.map(matchBot?.sponsors, (sponsor) => ({
        botName: matchBot.botName,
        minVotingPower: matchBot.minVotingPower,
        sponsor: sponsor.sponsor,
        note: sponsor.note,
        enabled: sponsor.enabled,
        votingPercent: sponsor.votingPercent,
        expiredAt: sponsor.expiredAt,
      }));

      return {
        results: mappedData || [],
        votingPower: (matchBot && matchBot.minVotingPower) || null,
      };
    } catch (error) {
      this.logger.error(error.message);
      return {
        results: [],
        votingPower: null,
      };
    }
  }

  async setVotingPower({
    botName,
    minVotingPower,
  }: SetSponsorsBotVotingPowerType): Promise<boolean> {
    try {
      const result = await this.model.updateOne(
        { botName },
        { minVotingPower },
        { runValidators: true },
      );

      return !!result.modifiedCount;
    } catch (error) {
      this.logger.error(error.message);
      return false;
    }
  }

  async updateStatus({
    botName,
    enabled,
  }: UpdateSponsorsStatusType): Promise<boolean> {
    try {
      const result = await this.model.updateOne(
        { botName },
        { 'sponsors.$[].enabled': enabled },
        { runValidators: true },
      );

      return !!result.modifiedCount;
    } catch (error) {
      this.logger.error(error.message);
      return false;
    }
  }

  async inactivateRules(): Promise<void> {
    try {
      await this.model.updateMany(
        { 'sponsors.expiredAt': { $lte: moment().utc().startOf('day') } },
        { 'sponsors.$.enabled': false },
      );
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOne({
    filter,
    projection,
    options,
  }: SponsorsBotFindType): Promise<SponsorsBotDocumentType> {
    try {
      return this.model.findOne(filter, projection, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async find({
    filter,
    projection,
    options,
  }: SponsorsBotFindType): Promise<SponsorsBotDocumentType[]> {
    try {
      return this.model.find(filter, projection, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
