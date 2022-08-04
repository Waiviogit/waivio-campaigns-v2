import {
  FormattedMapType,
  MapType,
} from '../../../../domain/campaign/rewards/types';
import { ApiProperty } from '@nestjs/swagger';

class MapDto {
  @ApiProperty({ type: Number })
  latitude: number;

  @ApiProperty({ type: Number })
  longitude: number;
}

class FormattedMapDto {
  @ApiProperty({ type: Number })
  maxReward: number;

  @ApiProperty({ type: String })
  author_permlink: string;

  @ApiProperty({ type: String })
  avatar: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: () => MapDto })
  map: MapType;
}

export class RewardsMapOutDto {
  @ApiProperty({ type: () => [FormattedMapDto] })
  rewards: FormattedMapType[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
