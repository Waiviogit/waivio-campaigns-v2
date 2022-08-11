import { ApiProperty } from '@nestjs/swagger';
import {
  RequirementsDto,
  UserRequirementsDto,
} from '../../campaign/campaign.dto';
import { ProcessedWobjectType } from '../../../../domain/wobject/types';
import { ProcessedWobjectDto } from '../../wobject/processed-wobject.dto';

export class RewardDto {
  @ApiProperty({ type: Number })
  maxReward: number;

  @ApiProperty({ type: Number })
  minReward: number;

  @ApiProperty({ type: String })
  payoutToken: string;

  @ApiProperty({ type: String })
  currency: string;

  @ApiProperty({ type: Number })
  reward: number;

  @ApiProperty({ type: Number })
  rewardInUSD: number;

  @ApiProperty({ type: String })
  guideName: string;

  @ApiProperty({ type: () => RequirementsDto })
  requirements: RequirementsDto;

  @ApiProperty({ type: () => UserRequirementsDto })
  userRequirements: UserRequirementsDto;

  @ApiProperty({ type: () => ProcessedWobjectDto })
  object: ProcessedWobjectType;
}
