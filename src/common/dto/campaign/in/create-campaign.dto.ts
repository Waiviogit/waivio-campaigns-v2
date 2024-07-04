import { CampaignDto } from '../campaign.dto';
import { OmitType } from '@nestjs/swagger';

export class CreateCampaignDto extends OmitType(CampaignDto, [
  '_id',
  'status',
  'campaignServer',
  'users',
  'activationPermlink',
  'deactivationPermlink',
  'rewardInUSD',
  'createdAt',
]) {}
