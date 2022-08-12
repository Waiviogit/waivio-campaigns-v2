import { Inject, Injectable } from '@nestjs/common';
import {
  CAMPAIGN_PROVIDE,
  RESERVATION_STATUS,
  WOBJECT_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  GetReservationDetailsInterface,
  ReservationDetailsInterface,
} from './interface';
import { WobjectRepositoryInterface } from '../../../persistance/wobject/interface';
import { WobjectHelperInterface } from '../../wobject/interface';
import * as _ from 'lodash';
import { GetReservationDetailsType } from './types/reservation-details.types';

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

    const objects = await this.wobjectHelper.getWobjectsForCampaigns({
      links: [campaign.requiredObject, campaign.users[0].objectPermlink],
      host,
    });

    const mappedObjects = _.map(objects, (o) =>
      _.pick(o, ['author_permlink', 'name', 'default_name']),
    );
    const requiredObject = _.find(
      mappedObjects,
      (w) => w.author_permlink === campaign.requiredObject,
    );
    const secondaryObject = _.find(
      mappedObjects,
      (w) => w.author_permlink === campaign.users[0].objectPermlink,
    );

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
}
