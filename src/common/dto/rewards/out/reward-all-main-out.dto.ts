import { ApiProperty, PickType } from '@nestjs/swagger';
import { RewardDto } from './reward.dto';
import { RewardsMainType } from '../../../../domain/campaign/rewards/types/rewards-all.types';

export class RewardsMainDto extends PickType(RewardDto, [
  'object',
  'maxReward',
  'minReward',
  'payoutToken',
  'currency',
  'reward',
  'rewardInUSD',
]) {}

export class RewardsAllMainOutDto {
  @ApiProperty({ type: [RewardsMainDto] })
  rewards: RewardsMainType[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
