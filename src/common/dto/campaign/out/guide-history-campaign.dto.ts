import { GuideManageCampaignType } from '../../../../domain/campaign/types';
import { ApiProperty } from '@nestjs/swagger';
import { GuideManageCampaignDto } from './guide-active-campaigns.dto';

export class GuideHistoryCampaignDto {
  @ApiProperty({ type: [GuideManageCampaignDto] })
  campaigns: GuideManageCampaignType[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
