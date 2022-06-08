import { ApiProperty, PickType } from '@nestjs/swagger';
import { CampaignDto } from '../campaign.dto';

export class GuideManageCampaignDto extends PickType(CampaignDto, [
  '_id',
  'name',
  'activationPermlink',
  'status',
  'type',
  'users',
  'budget',
  'reward',
  'rewardInUSD',
  'agreementObjects',
  'requiredObject',
  'requirements',
  'userRequirements',
  'expiredAt',
  'createdAt',
  'guideName',
  'currency',
  'commissionAgreement',
]) {
  @ApiProperty({ type: Number })
  remaining: number;

  @ApiProperty({ type: Number })
  reserved: number;

  @ApiProperty({ type: Number })
  completed: number;

  @ApiProperty({ type: Number })
  completedTotal: number;

  @ApiProperty({ type: Number })
  budgetUSD: number;
}
