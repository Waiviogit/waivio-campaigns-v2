import { ApiProperty } from '@nestjs/swagger';
import { RewardsMainDto } from './reward-all-main-out.dto';
import {
  RewardsByRequiredType,
  RewardsMainType,
} from '../../../../domain/campaign/rewards/types';
import { RewardAllOutDto } from './reward-all-out.dto';

export class UserRewardsOutDto {
  @ApiProperty({ type: String })
  user: string;

  @ApiProperty({ type: RewardsMainDto })
  main: RewardsMainType | null;

  @ApiProperty({ type: [RewardAllOutDto] })
  secondary: RewardsByRequiredType[];
}
