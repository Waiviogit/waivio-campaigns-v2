import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import {
  APP_PROVIDE,
  CAMPAIGN_FIELDS,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  COLLECTION,
  MUTED_USER_PROVIDE,
  RESERVATION_STATUS,
  REWARDS_PROVIDE,
  WOBJECT_PROVIDE,
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
import { WobjectHelperInterface } from '../../wobject/interface';
import { AppRepositoryInterface } from '../../../persistance/app/interface';
import { WobjectRepositoryInterface } from '../../../persistance/wobject/interface';
import { ProcessedWobjectType } from '../../wobject/types';
import { MutedUserRepositoryInterface } from '../../../persistance/muted-user/interface';

@Injectable()
export class ObjectRewards implements ObjectRewardsInterface {
  constructor(
    @Inject(REWARDS_PROVIDE.ALL)
    private readonly rewardsAll: RewardsAllInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
    @Inject(APP_PROVIDE.REPOSITORY)
    private readonly appRepository: AppRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.REPOSITORY)
    private readonly wobjectRepository: WobjectRepositoryInterface,
    @Inject(MUTED_USER_PROVIDE.REPOSITORY)
    private readonly mutedUserRepository: MutedUserRepositoryInterface,
  ) {}

  async getObjectRewards({
    authorPermlink,
    userName,
    host,
  }: GetObjectRewardsInterface): Promise<ObjectRewardsType> {
    if (!authorPermlink) {
      return {
        authorPermlink,
        main: null,
        secondary: [],
      };
    }

    const { rewards } = await this.rewardsAll.getRewardsMain({
      host,
      skip: 0,
      limit: 1,
      requiredObjects: [authorPermlink],
      userName,
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
    const mutedList = await this.mutedUserRepository.find({
      filter: { mutedBy: userName },
    });
    const mutedNames = mutedList.map((el) => el.userName);

    const rewards: RewardsByRequiredType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              ...(mutedNames?.length && { guideName: { $nin: mutedNames } }),
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
              commentsCount: {
                $arrayElemAt: ['$assignedUser.commentsCount', 0],
              },
              reservationPermlink: {
                $arrayElemAt: ['$assignedUser.reservationPermlink', 0],
              },
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
              rootName: {
                $let: {
                  vars: {
                    firstMember: {
                      $arrayElemAt: ['$assignedUser', 0],
                    },
                  },
                  in: '$$firstMember.rootName',
                },
              },
              payoutTokenRateUSD: {
                $let: {
                  vars: {
                    firstMember: {
                      $arrayElemAt: ['$assignedUser', 0],
                    },
                  },
                  in: '$$firstMember.payoutTokenRateUSD',
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
              requiredObject: 1,
              type: 1,
            },
          },
        ],
      });

    const app = await this.appRepository.findOneByHost(host);

    const primary = await this.wobjectRepository.find({
      filter: { author_permlink: { $in: _.map(rewards, 'requiredObject') } },
    });

    const requiredObjects = await this.wobjectHelper.processWobjects({
      wobjects: primary as ProcessedWobjectType[],
      fields: CAMPAIGN_FIELDS,
      app,
      returnArray: true,
      reqUserName: userName,
    });

    const rewardsWithData = await this.rewardsAll.addDataOnRewardsByObject({
      rewards,
      host,
      userName,
    });

    return _.reduce(
      rewardsWithData,
      (acc, r) => {
        const requiredObject = _.find(
          requiredObjects,
          (o) => o?.author_permlink === r?.requiredObject,
        );
        if (requiredObject?.author_permlink === r?.object?.author_permlink) {
          return acc;
        }
        acc.push({
          ...r,
          requiredObject,
        });
        return acc;
      },
      [],
    );
  }
}
