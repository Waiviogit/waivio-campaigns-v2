import { ApiProperty } from '@nestjs/swagger';
import {
  ObjectsFollowingType,
  UserFollowingType,
} from '../../../../domain/campaign/rewards/types';

class UserFollowingsDto {
  @ApiProperty({ type: String, required: false })
  name: string;
  @ApiProperty({ type: Boolean, required: false })
  follow: boolean;
}

class ObjectFollowingsDto {
  @ApiProperty({ type: String, required: false })
  authorPermlink: string;
  @ApiProperty({ type: Boolean, required: false })
  follow: boolean;
}

export class UserFollowingsOutDto {
  @ApiProperty({ type: [UserFollowingsDto], required: false })
  users: UserFollowingType[];

  @ApiProperty({ type: [ObjectFollowingsDto], required: false })
  objects: ObjectsFollowingType[];
}
