import { PickType } from '@nestjs/swagger';
import { RewardDto } from './reward.dto';

export class RewardAllOutDto extends PickType(RewardDto, [
  'object',
  'payoutToken',
  'currency',
  'reward',
  'rewardInUSD',
  'guideName',
  'requirements',
  'userRequirements',
]) {}
