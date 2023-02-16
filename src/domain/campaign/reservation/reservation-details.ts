import { Inject, Injectable } from '@nestjs/common';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  RESERVATION_STATUS,
  WOBJECT_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  GetReservationDetailsInterface,
  reservationCountInterface,
  ReservationDetailsInterface,
} from './interface';
import { WobjectRepositoryInterface } from '../../../persistance/wobject/interface';
import { WobjectHelperInterface } from '../../wobject/interface';
import * as _ from 'lodash';
import {
  GetReservationDetailsType,
  reservationCountType,
} from './types/reservation-details.types';

@Injectable()
export class ReservationDetails implements ReservationDetailsInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.REPOSITORY)
    private readonly wobjectRepository: WobjectRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
  ) {}

  async getDetails({
    campaignId,
    userName,
    host,
  }: GetReservationDetailsInterface): Promise<GetReservationDetailsType> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        _id: campaignId,
        users: {
          $elemMatch: {
            name: userName,
            status: RESERVATION_STATUS.ASSIGNED,
          },
        },
      },
      projection: {
        'users.$': 1,
        requiredObject: 1,
        requirements: 1,
        guideName: 1,
        name: 1,
        app: 1,
      },
    });
    if (!campaign) {
      return;
    }

    const { requiredObject, secondaryObject } =
      await this.wobjectHelper.getRequiredAndSecondaryObjects({
        requiredPermlink: campaign.requiredObject,
        secondaryPermlink: campaign.users[0].objectPermlink,
        host,
      });

    return {
      _id: campaignId,
      requiredObject,
      secondaryObject,
      app: campaign.app,
      name: campaign.name,
      guideName: campaign.guideName,
      requirements: campaign.requirements,
      userRequirements: campaign.userRequirements,
      reservationPermlink: _.get(campaign, 'users[0].reservationPermlink'),
    };
  }

  async reservationCount({
    userName,
  }: reservationCountInterface): Promise<reservationCountType> {
    const result: reservationCountType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              status: {
                $in: [CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.ON_HOLD],
              },
              users: {
                $elemMatch: {
                  name: userName,
                  status: RESERVATION_STATUS.ASSIGNED,
                },
              },
            },
          },
          { $count: 'count' },
        ],
      });
    return result[0]?.count ? result[0] : { count: 0 };
  }
}
