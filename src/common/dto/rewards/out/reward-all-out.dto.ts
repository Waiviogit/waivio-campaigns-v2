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
]) {
  @ApiProperty({ type: Number })
  totalPayed: number;

  @ApiProperty({ type: Number })
  frequencyAssign: number;

  @ApiProperty({ type: [String] })
  matchBots: string[];

  @ApiProperty({ type: [String] })
  agreementObjects: string[];

  @ApiProperty({ type: String })
  usersLegalNotice: string;

  @ApiProperty({ type: String })
  description: string;
}

export class RewardsByObjectOutDto {
  @ApiProperty({ type: [RewardAllOutDto] })
  rewards: RewardsByRequiredType[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
