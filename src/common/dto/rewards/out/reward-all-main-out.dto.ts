import { PickType } from '@nestjs/swagger';
import { RewardDto } from './reward.dto';

export class RewardAllMainOutDto extends PickType(RewardDto, [
  'object',
  'maxReward',
  'minReward',
  'payoutToken',
  'currency',
  'reward',
  'rewardInUSD',
]) {}
