import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import {
  AssignReservationType,
  CheckReserveInSameCampaignsType,
  CountReservationDaysType,
  ValidateAssignType,
  validateAssignType,
} from './types';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  RESERVATION_STATUS,
  USER_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import { CampaignHelperInterface } from '../interface';

@Injectable()
export class AssignReservation {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async assign({
    activationPermlink,
    reservationPermlink,
    name,
    requiredObject,
    rootName,
    referralServer,
  }: AssignReservationType): Promise<void> {
    const { isValid, reservationTime } = await this.validateAssign({
      activationPermlink,
      reservationPermlink,
      name,
      requiredObject,
    });
    if (!isValid) return;
    await this.campaignHelper.setExpireAssign({
      reservationTime,
      requiredObject,
      reservationPermlink,
      name,
      activationPermlink,
    });
    const campaign = await this.campaignRepository.findOne({
      filter: {
        activationPermlink,
        status: CAMPAIGN_STATUS.ACTIVE,
      },
      projection: { payoutToken: 1 },
    });

    const payoutTokenRateUSD = await this.campaignHelper.getPayoutTokenRateUSD(
      campaign.payoutToken,
    );
    await this.campaignRepository.updateOne({
      filter: { activationPermlink, status: CAMPAIGN_STATUS.ACTIVE },
      update: {
        $push: {
          users: {
            name,
            rootName,
            status: RESERVATION_STATUS.ASSIGNED,
            payoutTokenRateUSD,
            objectPermlink: requiredObject,
            reservationPermlink,
            referralServer,
          },
        },
      },
    });
  }

  async validateAssign({
    activationPermlink,
    reservationPermlink,
    name,
    requiredObject,
  }: ValidateAssignType): Promise<validateAssignType> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        activationPermlink,
        status: CAMPAIGN_STATUS.ACTIVE,
      },
    });
    const user = await this.userRepository.findOne({ filter: { name } });
    const todaySpendTime =
      new Date().getUTCHours() * 3600 +
      new Date().getUTCMinutes() * 60 +
      new Date().getUTCSeconds();

    if (
      !campaign ||
      !campaign.objects.includes(requiredObject) ||
      !user ||
      !reservationPermlink
    ) {
      return {
        isValid: false,
        message:
          'Invalid campaign activation permlink, reservation permlink or invalid user',
      };
    }
    const existPermlinkReservation = await this.campaignRepository.findOne({
      filter: { 'users.permlink': reservationPermlink },
    });
    if (existPermlinkReservation) {
      return { isValid: false, message: 'Reservation permlink not unique' };
    }
    if (!campaign.canAssign) {
      return { isValid: false, message: 'Reserve exceeded by budget' };
    }
    const { lastCompleted } =
      await this.campaignHelper.getCompletedUsersInSameCampaigns({
        guideName: campaign.guideName,
        requiredObject: campaign.requiredObject,
        userName: name,
      });

    const daysPassed = Math.trunc(
      (new Date().valueOf() - new Date(lastCompleted).valueOf()) / 86400000,
    );
    if (campaign.frequencyAssign > daysPassed) {
      return { isValid: false, message: 'Reservation frequency is exeeded' };
    }
    const assignedUser = _.find(
      campaign.users,
      (user) =>
        user.name === name && user.status === RESERVATION_STATUS.ASSIGNED,
    );
    if (assignedUser) {
      return { isValid: false, message: 'Reservation is exist' };
    }
    const canAssignBySameMainObject = await this.checkReserveInSameCampaigns({
      guideName: campaign.guideName,
      requiredObject: campaign.requiredObject,
      name,
    });

    if (!canAssignBySameMainObject) {
      return {
        isValid: false,
        message: 'Reservation in this main object is exist',
      };
    }

    const limitReservationDays = this.countReservationDays({
      reservationTimetable: campaign.reservationTimetable,
      countReservationDays: campaign.countReservationDays,
    });

    if (limitReservationDays === 0) {
      return { isValid: false, message: 'Today can not reservation' };
    }
    const reservationTime = 86400 * limitReservationDays - todaySpendTime;

    return {
      isValid: true,
      message: 'ok',
      campaign,
      limitReservationDays,
      reservationTime,
    };
  }

  async checkReserveInSameCampaigns({
    guideName,
    requiredObject,
    name,
  }: CheckReserveInSameCampaignsType): Promise<boolean> {
    const reservationsCurrentObject = await this.campaignRepository.aggregate({
      pipeline: [
        { $unwind: '$users' },
        {
          $match: {
            guideName,
            status: 'active',
            requiredObject,
            'users.name': name,
            'users.status': 'assigned',
          },
        },
      ],
    });

    return _.isEmpty(reservationsCurrentObject);
  }

  countReservationDays({
    reservationTimetable,
    countReservationDays,
  }: CountReservationDaysType): number {
    let approvedDays = 0;
    const dayKeys = Object.keys(reservationTimetable);
    const currentDay = new Date().getDay();
    const sortedDays = dayKeys
      .slice(currentDay - 1, 7)
      .concat(dayKeys.slice(0, currentDay - 1));

    for (const day of sortedDays) {
      if (day === sortedDays[6] && reservationTimetable[day]) {
        approvedDays = countReservationDays;
        break;
      }
      if (reservationTimetable[day]) {
        approvedDays += 1;
      } else {
        break;
      }
    }
    return _.min([approvedDays, countReservationDays]);
  }
}
