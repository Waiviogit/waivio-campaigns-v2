import { ApiProperty, PickType } from '@nestjs/swagger';
import { RewardDto } from './reward.dto';
import { RewardsByRequiredType } from '../../../../domain/campaign/rewards/types/rewards-all.types';

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

export class RewardsByObjectOutDto {
  @ApiProperty({ type: [RewardAllOutDto] })
  rewards: RewardsByRequiredType[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
