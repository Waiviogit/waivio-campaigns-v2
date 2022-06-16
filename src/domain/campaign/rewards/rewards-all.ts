import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import {
  APP_PROVIDE,
  CAMPAIGN_FIELDS,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  COLLECTION,
  WOBJECT_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  GetRewardsByRequiredObjectType,
  GetRewardsMainType,
  RewardsAllType, RewardsByObjectType,
  RewardsByRequiredType,
  RewardsMainType,
} from './types/rewards-all.types';
import { WobjectHelperInterface } from '../../wobject/interface';
import { AppRepositoryInterface } from '../../../persistance/app/interface';
import { RewardsAllInterface } from './interface/rewards-all.interface';

@Injectable()
export class RewardsAll implements RewardsAllInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
    @Inject(APP_PROVIDE.REPOSITORY)
    private readonly appRepository: AppRepositoryInterface,
  ) {}

  async getRewardsMain({
    skip,
    limit,
    host,
  }: GetRewardsMainType): Promise<RewardsAllType> {
    const rewards: RewardsMainType[] = await this.campaignRepository.aggregate({
      pipeline: [
        { $match: { status: CAMPAIGN_STATUS.ACTIVE } },
        {
          $group: {
            _id: '$requiredObject',
            maxReward: { $max: '$reward' },
            minReward: { $min: '$reward' },
          },
        },
        { $skip: skip },
        { $limit: limit + 1 },
        {
          $lookup: {
            from: COLLECTION.WOBJECTS,
            localField: '_id',
            foreignField: 'author_permlink',
            as: 'object',
          },
        },
        {
          $project: {
            object: { $arrayElemAt: ['$object', 0] },
            maxReward: 1,
            minReward: 1,
            payoutToken: 1,
            currency: 1,
            reward: 1,
            rewardInUSD: 1,
          },
        },
      ],
    });
    const app = await this.appRepository.findOneByHost(host);
    for (const reward of rewards) {
      reward.object = await this.wobjectHelper.processWobjects({
        wobjects: reward.object,
        fields: CAMPAIGN_FIELDS,
        app,
      });
    }
    return {
      rewards: _.take(rewards, limit),
      hasMore: rewards.length > limit,
    };
  }

  async getRewardsByRequiredObject({
    requiredObject,
    skip,
    limit,
    host,
  }: GetRewardsByRequiredObjectType): Promise<RewardsByObjectType> {
    const rewards: RewardsByRequiredType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          { $match: { requiredObject, status: CAMPAIGN_STATUS.ACTIVE } },
          { $unwind: { path: '$objects' } },
          { $skip: skip },
          { $limit: limit + 1 },
          {
            $lookup: {
              from: COLLECTION.WOBJECTS,
              localField: 'objects',
              foreignField: 'author_permlink',
              as: 'object',
            },
          },
          {
            $project: {
              object: { $arrayElemAt: ['$object', 0] },
              payoutToken: 1,
              currency: 1,
              reward: 1,
              rewardInUSD: 1,
              //diff
              guideName: 1,
              requirements: 1,
              userRequirements: 1,
            },
          },
        ],
      });
    const app = await this.appRepository.findOneByHost(host);
    for (const reward of rewards) {
      reward.object = await this.wobjectHelper.processWobjects({
        wobjects: reward.object,
        fields: CAMPAIGN_FIELDS,
        app,
      });
    }

    return {
      rewards: _.take(rewards, limit),
      hasMore: rewards.length > limit,
    };
  }
}
