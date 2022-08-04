import { Inject, Injectable } from '@nestjs/common';
import {
  APP_PROVIDE,
  CAMPAIGN_FIELDS,
  CAMPAIGN_MAP_FIELDS,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  REWARDS_PROVIDE,
  USER_PROVIDE,
  WOBJECT_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  FormattedMapType,
  RewardsAggregateMapType,
  RewardsMapType,
} from './types';
import {
  GetFormattedMapInterface,
  GetMapAllInterface,
  GetMapEligibleInterface,
  GetMapPipeInterface,
  RewardsMapInterface,
} from './interface/rewards-map.interface';
import { WobjectHelperInterface } from '../../wobject/interface';
import { AppRepositoryInterface } from '../../../persistance/app/interface';
import * as _ from 'lodash';
import { parseJSON } from '../../../common/helpers';
import { RewardsAllInterface } from './interface/rewards-all.interface';
import { PipelineStage } from 'mongoose';
import { UserRepositoryInterface } from '../../../persistance/user/interface';

@Injectable()
export class RewardsMap implements RewardsMapInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
    @Inject(APP_PROVIDE.REPOSITORY)
    private readonly appRepository: AppRepositoryInterface,
    @Inject(REWARDS_PROVIDE.ALL)
    private readonly rewardsAll: RewardsAllInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}
  private readonly notFoundResp = {
    rewards: [],
    hasMore: false,
  };

  async getMapAll({
    host,
    box,
    skip = 0,
    limit = 10,
  }: GetMapAllInterface): Promise<RewardsMapType> {
    const rewards: RewardsAggregateMapType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              status: CAMPAIGN_STATUS.ACTIVE,
            },
          },
          ...this.getMapPipe({ box, skip, limit }),
        ],
      });

    if (_.isEmpty(rewards)) {
      return this.notFoundResp;
    }

    const formattedMap = await this.getFormattedMap({ rewards, host });

    return {
      rewards: _.take(formattedMap, limit),
      hasMore: formattedMap.length > limit,
    };
  }

  async getMapEligible({
    host,
    box,
    skip = 0,
    limit = 10,
    userName,
  }: GetMapEligibleInterface): Promise<RewardsMapType> {
    const user = await this.userRepository.findOne({
      filter: { name: userName },
      projection: { count_posts: 1, followers_count: 1, wobjects_weight: 1 },
    });
    if (!user) {
      return this.notFoundResp;
    }
    const eligiblePipe = await this.rewardsAll.getEligiblePipe({
      userName,
      user,
    });
    const rewards: RewardsAggregateMapType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              status: CAMPAIGN_STATUS.ACTIVE,
            },
          },
          ...eligiblePipe,
          ...this.getMapPipe({ box, skip, limit }),
        ],
      });

    if (_.isEmpty(rewards)) {
      return this.notFoundResp;
    }

    const formattedMap = await this.getFormattedMap({ rewards, host });

    return {
      rewards: _.take(formattedMap, limit),
      hasMore: formattedMap.length > limit,
    };
  }

  getMapPipe({ box, skip, limit }: GetMapPipeInterface): PipelineStage[] {
    return [
      {
        $group: {
          _id: '$requiredObject',
          maxReward: {
            $max: '$rewardInUSD',
          },
        },
      },
      {
        $lookup: {
          from: 'wobjects',
          localField: '_id',
          foreignField: 'author_permlink',
          as: 'object',
        },
      },
      {
        $addFields: {
          object: { $arrayElemAt: ['$object', 0] },
        },
      },
      {
        $match: {
          'object.map': {
            $geoWithin: {
              $box: [box.bottomPoint, box.topPoint],
            },
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit + 1,
      },
    ];
  }

  async getFormattedMap({
    rewards,
    host,
  }: GetFormattedMapInterface): Promise<FormattedMapType[]> {
    const app = await this.appRepository.findOneByHost(host);
    const objects = this.wobjectHelper.processWobjects({
      wobjects: rewards.map((r) => r.object),
      fields: CAMPAIGN_MAP_FIELDS,
      app,
      returnArray: true,
    });

    return rewards.map((reward) => {
      const object = objects.find((o) => o.author_permlink === reward._id);
      const fields = _.pick(object, [
        ...CAMPAIGN_MAP_FIELDS,
        'author_permlink',
      ]);
      return {
        maxReward: reward.maxReward,
        ...fields,
        map: parseJSON(fields.map),
      };
    });
  }
}
