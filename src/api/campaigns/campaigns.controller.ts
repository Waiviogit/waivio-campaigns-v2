import { Controller, Get, Param } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { GuideActiveCampaignDto } from '../../common/dto/campaign/out';
import { CampaignsControllerDocs } from './campaigns.controller.doc';
import { GuideBalanceDto } from '../../common/dto/campaign/out/guide-balance.dto';

@Controller('campaigns')
@CampaignsControllerDocs.main()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('manager/:guideName')
  @CampaignsControllerDocs.getActiveCampaigns()
  async getActiveCampaigns(
    @Param('guideName') guideName: string,
  ): Promise<GuideActiveCampaignDto[]> {
    return this.campaignsService.getActiveCampaigns(guideName);
  }

  @Get('balance/:guideName')
  @CampaignsControllerDocs.getBalances()
  async getBalance(
    @Param('guideName') guideName: string,
  ): Promise<GuideBalanceDto> {
    return this.campaignsService.getBalance(guideName);
  }
}
