import {
  CanReserveParamType,
  CanReserveType,
  GetEligiblePipeType,
  GetJudgeRewardsMainType,
  GetReservedType,
  GetRewardsByRequiredObjectType,
  GetRewardsEligibleType,
  GetRewardsJudgeType,
  GetRewardsMainType,
  GetSponsorsType,
  RewardsAllType,
  RewardsByObjectType,
  RewardsByRequiredType,
  RewardsTabType,
} from '../types';
import { PipelineStage } from 'mongoose';
import { AddDataOnRewardsByObjectType } from '../../../campaign-payment/types';

export interface RewardsAllInterface {
  getRewardsMain({
    skip,
    limit,
    host,
    sponsors,
    type,
    sort,
    area,
  }: GetRewardsMainType): Promise<RewardsAllType>;

  getRewardsByRequiredObject({
    requiredObject,
    skip,
    limit,
    host,
    sponsors,
    type,
    sort,
    area,
  }: GetRewardsByRequiredObjectType): Promise<RewardsByObjectType>;

  getSponsorsAll(params: GetSponsorsAllInterface): Promise<GetSponsorsType>;

  getRewardsEligibleMain({
    skip,
    limit,
    host,
    sponsors,
    type,
    sort,
    area,
    userName,
  }: GetRewardsEligibleType): Promise<RewardsAllType>;

  getEligibleByObject({
    skip,
    limit,
    host,
    sponsors,
    type,
    userName,
  }: GetRewardsEligibleType): Promise<RewardsByObjectType>;

  getReserved({
    userName,
    skip,
    limit,
    host,
    sort,
    area,
    type,
    sponsors,
  }: GetReservedType): Promise<RewardsByObjectType>;

  getRewardsTab(userName: string): Promise<RewardsTabType>;

  canReserve({
    userName,
    activationPermlink,
  }: CanReserveParamType): Promise<CanReserveType>;

  getSponsorsEligible({
    userName,
    requiredObject,
  }: GetSponsorsEligibleInterface): Promise<GetSponsorsType>;

  getEligiblePipe(params: GetEligiblePipeType): Promise<PipelineStage[]>;

  getReservedFilters(
    params: GetReservedFiltersInterface,
  ): Promise<GetSponsorsType>;

  addDataOnRewardsByObject({
    rewards,
    host,
  }: AddDataOnRewardsByObjectType): Promise<RewardsByRequiredType[]>;

  getUserRewards(params: GetRewardsEligibleType): Promise<RewardsAllType>;

  getJudgeRewardsMain(params: GetJudgeRewardsMainType): Promise<RewardsAllType>;

  getSponsorsJudge(params: GetSponsorsJudgeInterface): Promise<GetSponsorsType>;

  getJudgeRewardsByObject(
    params: GetRewardsJudgeType,
  ): Promise<RewardsByObjectType>;
}

export interface GetSponsorsEligibleInterface {
  userName: string;
  requiredObject?: string;
  reach?: string;
}

export interface GetSponsorsAllInterface {
  requiredObject?: string;
  reach?: string;
}

export interface GetSponsorsJudgeInterface extends GetSponsorsAllInterface {
  requiredObject?: string;
  reach?: string;
  judgeName: string;
}

export interface GetReservedFiltersInterface {
  userName: string;
}
