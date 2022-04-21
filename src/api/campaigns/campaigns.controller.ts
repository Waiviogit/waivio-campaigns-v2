import { Controller, Get, Param } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { GuideActiveCampaignDto } from '../../common/dto/campaign/out';
import { CampaignsControllerDocs } from './campaigns.controller.doc';

@Controller('campaigns')
@CampaignsControllerDocs.main()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('active/:guideName')
  @CampaignsControllerDocs.getActiveCampaigns()
  async getActiveCampaigns(
    @Param('guideName') guideName: string,
  ): Promise<GuideActiveCampaignDto[]> {
    return this.campaignsService.getActiveCampaigns(guideName);
  }
}
