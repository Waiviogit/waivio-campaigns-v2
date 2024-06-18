import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  GuideMessagesFiltersDto,
  GuideReservationFiltersDto,
  InBlacklistOutDto,
  ObjectRewardsOutDto,
  RewardsAllMainOutDto,
  RewardsByObjectOutDto,
  RewardsCanReserveOutDto,
  RewardsMapOutDto,
  RewardsTabDto,
  UserFollowingsOutDto,
  UserHistoryFiltersDto,
  UserRewardsOutDto,
} from '../../../common/dto/rewards/out';
import { RewardSponsorsDto } from '../../../common/dto/rewards/out/reward-sponsors.dto';

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

  static getTabType(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'get tab type',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: RewardsTabDto,
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
        summary: 'filters for sponsors and types',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: RewardSponsorsDto,
      }),
    );
  }

  static getReserve(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'validate user reservation',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: RewardsCanReserveOutDto,
      }),
    );
  }

  static getMap(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'get map for campaigns',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: RewardsMapOutDto,
      }),
    );
  }

  static getRewardsByObject(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'return rewards for object by author permlink',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: ObjectRewardsOutDto,
      }),
    );
  }

  static getRewardsByUser(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'return rewards for user by name',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: UserRewardsOutDto,
      }),
    );
  }

  static getGuideReservations(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'return guide campaigns reservations',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: RewardsByObjectOutDto,
      }),
    );
  }
  static getGuideReservationsFrauds(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'return guide fraud reservations',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: RewardsByObjectOutDto,
      }),
    );
  }

  static getReservationMessages(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'return guide campaigns reservations messages',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: RewardsByObjectOutDto,
      }),
    );
  }

  static getGuideReservationsFilters(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'return guide reservation filters',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: GuideReservationFiltersDto,
      }),
    );
  }

  static getUserHistory(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'return users reward history',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: RewardsByObjectOutDto,
      }),
    );
  }

  static getUserHistoryFilters(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'return users reward history filters',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: UserHistoryFiltersDto,
      }),
    );
  }

  static getMessagesFilter(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'return users reward history filters',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: GuideMessagesFiltersDto,
      }),
    );
  }

  static checkUserFollowings(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'return users and objects followed',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: UserFollowingsOutDto,
      }),
    );
  }
  static checkUserInBlacklist(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'return either user in blacklist',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        type: InBlacklistOutDto,
      }),
    );
  }
}
