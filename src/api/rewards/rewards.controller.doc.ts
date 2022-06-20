import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  RewardsAllMainOutDto,
  RewardsByObjectOutDto,
} from '../../common/dto/rewards/out';
import {RewardSponsorsDto} from "../../common/dto/rewards/out/reward-sponsors.dto";

export class RewardsControllerDoc {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('rewards'),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
      }),
      ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
      }),
    );
  }

  static getAllRewards(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'get all rewards',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: RewardsAllMainOutDto,
      }),
    );
  }
  static getAllRewardsByRequiredObject(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'get rewards by required object',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: RewardsByObjectOutDto,
      }),
    );
  }

  static getSponsors(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'get rewards by required object',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: RewardSponsorsDto,
      }),
    );
  }
}
