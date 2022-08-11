import {
  RewardsByRequiredType,
  RewardsMainType,
} from '../../../../domain/campaign/rewards/types';
import { ApiProperty } from '@nestjs/swagger';
import { RewardsMainDto } from './reward-all-main-out.dto';
import { RewardAllOutDto } from './reward-all-out.dto';

export class ObjectRewardsOutDto {
  @ApiProperty({ type: String })
  authorPermlink: string;

  @ApiProperty({ type: RewardsMainDto })
  main: RewardsMainType | null;

  @ApiProperty({ type: [RewardAllOutDto] })
  secondary: RewardsByRequiredType[];
}
