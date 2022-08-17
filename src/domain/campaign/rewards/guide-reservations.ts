import { CampaignDocumentType } from '../../../persistance/campaign/types';
import {
  CAMPAIGN_PROVIDE,
  RESERVATION_STATUS,
} from '../../../common/constants';
import { Inject } from '@nestjs/common';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';

export class GuideReservations {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
  ) {}
  async getReservations() {
    const campaigns: CampaignDocumentType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              users: {
                $elemMatch: {
                  status: RESERVATION_STATUS.ASSIGNED,
                  name: userName,
                },
              },
              ...(sponsors && { guideName: { $in: sponsors } }),
              ...(type && { type: { $in: type } }),
            },
          },
          {
            $addFields: {
              users: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$users',
                      as: 'user',
                      cond: {
                        $and: [
                          {
                            $eq: ['$$user.status', RESERVATION_STATUS.ASSIGNED],
                          },
                          { $eq: ['$$user.name', userName] },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
        ],
      });
  }
}
