import { BlacklistUserType } from '../../../../domain/blacklist/types';
import { ApiProperty } from '@nestjs/swagger';

class BlacklistUserDTO {
  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  json_metadata: string;

  @ApiProperty({ type: Number })
  wobjects_weight: number;
}

export class GetBlacklistsDto {
  @ApiProperty({ type: () => BlacklistUserDTO })
  user: BlacklistUserType;

  @ApiProperty({ type: () => [BlacklistUserDTO] })
  blackList: BlacklistUserType[];

  @ApiProperty({ type: () => [BlacklistUserDTO] })
  whiteList: BlacklistUserType[];

  @ApiProperty({ type: () => [BlacklistUserDTO] })
  followLists: BlacklistUserType[];
}
