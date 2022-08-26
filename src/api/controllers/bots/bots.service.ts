import { Inject, Injectable } from '@nestjs/common';
import {
  GetSponsorsBotInterface,
  SponsorsBotInterface,
} from '../../../domain/sponsors-bot/interface';
import { SponsorsBotApiType } from '../../../domain/sponsors-bot/type';
import { SPONSORS_BOT_PROVIDE } from '../../../common/constants';

@Injectable()
export class BotsService {
  constructor(
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
  ) {}

  async getSponsorsBot(
    params: GetSponsorsBotInterface,
  ): Promise<SponsorsBotApiType> {
    return this.sponsorsBot.getSponsorsBot(params);
  }
}
