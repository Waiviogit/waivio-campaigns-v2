import { Controller, Get, Param, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { GuideManageCampaignDto } from '../../common/dto/campaign/out';
import { CampaignsControllerDocs } from './campaigns.controller.doc';
import { GuideBalanceDto } from '../../common/dto/campaign/out/guide-balance.dto';
import { SkipLimitDto } from '../../common/dto/skip-limit.dto';
import {GuideHistoryCampaignDto} from "../../common/dto/campaign/out/guide-history-campaign.dto";

@Controller('campaigns')
@CampaignsControllerDocs.main()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('manager/:guideName')
  @CampaignsControllerDocs.getActiveCampaigns()
  async getActiveCampaigns(
    @Param('guideName') guideName: string,
  ): Promise<GuideManageCampaignDto[]> {
    return this.campaignsService.getActiveCampaigns(guideName);
  }

  @Get('balance/:guideName')
  @CampaignsControllerDocs.getBalances()
  async getBalance(
    @Param('guideName') guideName: string,
  ): Promise<GuideBalanceDto> {
    return this.campaignsService.getBalance(guideName);
  }

  @Get('history/:guideName')
  @CampaignsControllerDocs.getHistory()
  async getHistory(
    @Param('guideName') guideName: string,
    @Query() skipLimitDto: SkipLimitDto,
  ): Promise<GuideHistoryCampaignDto> {
    return this.campaignsService.getHistory({ guideName, ...skipLimitDto });
  }
}
