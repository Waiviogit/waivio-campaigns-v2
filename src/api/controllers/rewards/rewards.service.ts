import { Inject, Injectable } from '@nestjs/common';
import { REWARDS_PROVIDE } from '../../../common/constants';
import {
  GetReservedFiltersInterface,
  GetSponsorsAllInterface,
  GetSponsorsEligibleInterface,
  GetUserRewardsInterface,
  RewardsAllInterface,
  UserRewardsInterface,
} from '../../../domain/campaign/rewards/interface';
import {
  CanReserveParamType,
  CanReserveType,
  FilterReservationsType,
  FilterUserHistoryType,
  GetReservedType,
  GetRewardsByRequiredObjectType,
  GetRewardsEligibleType,
  GetRewardsMainType,
  GetSponsorsType,
  InBlacklistType,
  RewardsAllType,
  RewardsByObjectType,
  RewardsTabType,
  UserAndObjectFollowing,
} from '../../../domain/campaign/rewards/types';
import { RewardsMapType } from '../../../domain/campaign/rewards/types';
import {
  CheckUserFollowingsInterface,
  GetGuideReservationFiltersInterface,
  GetHistoryInterface,
  GetMapAllInterface,
  GetMapEligibleInterface,
  GetReservationMessagesInterface,
  GetReservationsInterface,
  GetReviewFraudsInterface,
  GetUserHistoryFiltersInterface,
  GuideReservationsInterface,
  ObjectRewardsInterface,
  RewardsMapInterface,
  UserHistoryInterface,
} from '../../../domain/campaign/rewards/interface';
import { GetObjectRewardsInterface } from '../../../domain/campaign/rewards/interface';
import { ObjectRewardsType } from '../../../domain/campaign/rewards/types/object-rewards.types';
import { CheckUserInBlacklistInterface } from '../../../domain/blacklist/interface';
import { UserRewardsType } from '../../../domain/campaign/rewards/types/user-rewards.types';

@Injectable()
export class RewardsService {
  constructor(
    @Inject(REWARDS_PROVIDE.ALL)
    private readonly rewardsAll: RewardsAllInterface,
    @Inject(REWARDS_PROVIDE.MAP)
    private readonly rewardsMap: RewardsMapInterface,
    @Inject(REWARDS_PROVIDE.OBJECT)
    private readonly objectRewards: ObjectRewardsInterface,
    @Inject(REWARDS_PROVIDE.USER)
    private readonly userRewards: UserRewardsInterface,
    @Inject(REWARDS_PROVIDE.GUIDE_RESERVATIONS)
    private readonly guideReservations: GuideReservationsInterface,
    @Inject(REWARDS_PROVIDE.USER_HISTORY)
    private readonly userHistory: UserHistoryInterface,
  ) {}

  async getAllRewards(params: GetRewardsMainType): Promise<RewardsAllType> {
    return this.rewardsAll.getRewardsMain(params);
  }

  async getUserRewards(
    params: GetRewardsEligibleType,
  ): Promise<RewardsAllType> {
    return this.rewardsAll.getUserRewards(params);
  }

  async getAllEligible(
    params: GetRewardsEligibleType,
  ): Promise<RewardsAllType> {
    return this.rewardsAll.getRewardsEligibleMain(params);
  }

  async getAllRewardsByRequiredObject(
    params: GetRewardsByRequiredObjectType,
  ): Promise<RewardsByObjectType> {
    return this.rewardsAll.getRewardsByRequiredObject(params);
  }

  async getEligibleByObject(
    params: GetRewardsEligibleType,
  ): Promise<RewardsByObjectType> {
    return this.rewardsAll.getEligibleByObject(params);
  }

  async getSponsorsAll(
    params: GetSponsorsAllInterface,
  ): Promise<GetSponsorsType> {
    return this.rewardsAll.getSponsorsAll(params);
  }

  async getSponsorsEligible(
    params: GetSponsorsEligibleInterface,
  ): Promise<GetSponsorsType> {
    return this.rewardsAll.getSponsorsEligible(params);
  }

  async getReserved(params: GetReservedType): Promise<RewardsByObjectType> {
    return this.rewardsAll.getReserved(params);
  }

  async getTabType(userName: string): Promise<RewardsTabType> {
    return this.rewardsAll.getRewardsTab(userName);
  }

  async canReserve(params: CanReserveParamType): Promise<CanReserveType> {
    return this.rewardsAll.canReserve(params);
  }

  async getEligibleMap(
    params: GetMapEligibleInterface,
  ): Promise<RewardsMapType> {
    return this.rewardsMap.getMapEligible(params);
  }

  async getAllMap(params: GetMapAllInterface): Promise<RewardsMapType> {
    return this.rewardsMap.getMapAll(params);
  }

  async getReservedFilters(
    params: GetReservedFiltersInterface,
  ): Promise<GetSponsorsType> {
    return this.rewardsAll.getReservedFilters(params);
  }

  async getRewardsByObject(
    params: GetObjectRewardsInterface,
  ): Promise<ObjectRewardsType> {
    return this.objectRewards.getObjectRewards(params);
  }

  async getRewardsByUser(
    params: GetUserRewardsInterface,
  ): Promise<UserRewardsType> {
    return this.userRewards.getUserRewards(params);
  }

  async getGuideReservations(
    params: GetReservationsInterface,
  ): Promise<RewardsByObjectType> {
    return this.guideReservations.getReservations(params);
  }

  async getGuideReservationsFilters(
    params: GetGuideReservationFiltersInterface,
  ): Promise<FilterReservationsType> {
    return this.guideReservations.getFilters(params);
  }

  async getUserHistory(
    params: GetHistoryInterface,
  ): Promise<RewardsByObjectType> {
    return this.userHistory.getHistory(params);
  }

  async getUserHistoryFilters(
    params: GetUserHistoryFiltersInterface,
  ): Promise<FilterUserHistoryType> {
    return this.userHistory.getFilters(params);
  }

  async getGuideReservationsFrauds(
    params: GetReviewFraudsInterface,
  ): Promise<RewardsByObjectType> {
    return this.guideReservations.getReviewFrauds(params);
  }

  async getReservationMessages(
    params: GetReservationMessagesInterface,
  ): Promise<RewardsByObjectType> {
    return this.guideReservations.getReservationMessages(params);
  }

  async checkUserFollowings(
    params: CheckUserFollowingsInterface,
  ): Promise<UserAndObjectFollowing> {
    return this.userHistory.checkUserFollowings(params);
  }

  async checkUserInBlacklist(
    params: CheckUserInBlacklistInterface,
  ): Promise<InBlacklistType> {
    return this.guideReservations.checkUserInBlacklist(params);
  }
}
