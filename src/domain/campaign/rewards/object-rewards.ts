import { Inject, Injectable } from '@nestjs/common';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  COLLECTION,
  RESERVATION_STATUS,
  REWARDS_PROVIDE,
} from '../../../common/constants';
import {
  GetObjectRewardsInterface,
  GetSecondaryObjectsRewards,
  ObjectRewardsInterface,
  RewardsAllInterface,
} from './interface';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import { RewardsByRequiredType } from './types';
import { ObjectRewardsType } from './types/object-rewards.types';

@Injectable()
export class ObjectRewards implements ObjectRewardsInterface {
  constructor(
    @Inject(REWARDS_PROVIDE.ALL)
    private readonly rewardsAll: RewardsAllInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
  ) {}

  async getObjectRewards({
    authorPermlink,
    userName,
    host,
  }: GetObjectRewardsInterface): Promise<ObjectRewardsType> {
    const { rewards } = await this.rewardsAll.getRewardsMain({
      host,
      skip: 0,
      limit: 1,
      requiredObjects: [authorPermlink],
    });
    const main = rewards[0] || null;

    const secondary = await this.getSecondaryObjectRewards({
      userName,
      objectLinks: [authorPermlink],
      host,
    });

    return {
      authorPermlink,
      main,
      secondary,
    };
  }

  async getSecondaryObjectRewards({
    userName,
    objectLinks,
    host,
  }: GetSecondaryObjectsRewards): Promise<RewardsByRequiredType[]> {
    const rewards: RewardsByRequiredType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              status: CAMPAIGN_STATUS.ACTIVE,
              objects: { $in: objectLinks },
            },
          },
          { $sort: { rewardInUsd: -1 } },
          { $unwind: { path: '$objects' } },
          { $match: { objects: { $in: objectLinks } } },
          {
            $lookup: {
              from: COLLECTION.WOBJECTS,
              localField: 'objects',
              foreignField: 'author_permlink',
              as: 'object',
            },
          },
          {
            $addFields: {
              assignedUser: {
                $filter: {
                  input: '$users',
                  as: 'user',
                  cond: {
                    $and: [
                      { $eq: ['$$user.status', RESERVATION_STATUS.ASSIGNED] },
                      { $eq: ['$$user.name', userName] },
                      {
                        $eq: ['$$user.objectPermlink', '$objects'],
                      },
                    ],
                  },
                },
              },
            },
          },
          {
            $project: {
              object: { $arrayElemAt: ['$object', 0] },
              reserved: { $gt: ['$assignedUser', []] },
              reservationCreatedAt: {
                $let: {
                  vars: {
                    firstMember: {
                      $arrayElemAt: ['$assignedUser', 0],
                    },
                  },
                  in: '$$firstMember.createdAt',
                },
              },
              frequencyAssign: 1,
              matchBots: 1,
              agreementObjects: 1,
              usersLegalNotice: 1,
              description: 1,
              payoutToken: 1,
              currency: 1,
              reward: 1,
              objects: 1,
              rewardInUSD: 1,
              guideName: 1,
              requirements: 1,
              userRequirements: 1,
              countReservationDays: 1,
              activationPermlink: 1,
            },
          },
        ],
      });

    return this.rewardsAll.addDataOnRewardsByObject({
      rewards,
      host,
    });
  }
}
