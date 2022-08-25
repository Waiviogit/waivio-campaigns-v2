import { Controller, Get, Query } from '@nestjs/common';
import { BotsService } from './bots.service';
import { SponsorsBotInDto } from '../../../common/dto/bots/in';
import { SponsorsBotOutDto } from '../../../common/dto/bots/out';
import { BotsControllerDoc } from './bots.controller.doc';

@Controller('bots')
@BotsControllerDoc.main()
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @Get('sponsors')
  @BotsControllerDoc.getSponsorsBot()
  async getSponsorsBot(
    @Query() query: SponsorsBotInDto,
  ): Promise<SponsorsBotOutDto> {
    return this.botsService.getSponsorsBot(query);
  }
}
