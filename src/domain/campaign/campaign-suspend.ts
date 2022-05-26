import { Inject, Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import * as moment from 'moment';

import {
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  PAYABLE_DEADLINE,
  PAYABLE_DEBT_MAX_USD,
  PAYABLE_WARNING,
  REDIS_KEY,
  REDIS_PROVIDE,
  WOBJECT_PROVIDE,
} from '../../common/constants';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { GuideAggType } from './types';
import { GuidePaymentsQueryInterface } from '../campaign-payment/interface';
import { CampaignHelperInterface, CampaignSuspendInterface } from './interface';
import { PayablesAllType } from '../campaign-payment/types';
import { WobjectHelperInterface } from '../wobject/interface';
import { RedisClientInterface } from '../../services/redis/clients/interface';
import { WobjectRepositoryInterface } from '../../persistance/wobject/interface';
import { CampaignDocumentType } from '../../persistance/campaign/types';

@Injectable()
export class CampaignSuspend implements CampaignSuspendInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.REPOSITORY)
    private readonly wobjectRepository: WobjectRepositoryInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.GUIDE_PAYMENTS_Q)
    private readonly guidePaymentsQuery: GuidePaymentsQueryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
  ) {}

  async startJob(): Promise<void> {
    const guides: GuideAggType[] = await this.campaignRepository.aggregate({
      pipeline: [
        { $match: { status: { $nin: [CAMPAIGN_STATUS.SUSPENDED] } } },
        {
          $group: { _id: '$guideName', tokens: { $addToSet: '$payoutToken' } },
        },
        {
          $project: {
            _id: 0,
            guideName: '$_id',
            tokens: 1,
          },
        },
      ],
    });
    for (const guide of guides) {
      const debt = await this.getGuideDebt(guide);
      if (debt.gt(PAYABLE_DEBT_MAX_USD)) {
        await this.suspendCampaigns(guide.guideName);
      }
    }
  }

  async getGuideDebt(guide: GuideAggType): Promise<BigNumber> {
    let debtInUSD = new BigNumber(0);

    for (const payoutToken of guide.tokens) {
      const tokenRate = await this.campaignHelper.getPayoutTokenRateUSD(
        payoutToken,
      );
      const payments = await this.guidePaymentsQuery.getPayables({
        guideName: guide.guideName,
        payoutToken,
      });

      if (_.isEmpty(payments.histories)) continue;
      await this.checkPayableWarning(guide.guideName, payments.histories);
      const notPayedOverDeadline = _.filter(
        payments.histories,
        (el) => el.notPayedPeriod > PAYABLE_DEADLINE,
      );
      if (_.isEmpty(notPayedOverDeadline)) continue;
      debtInUSD = debtInUSD.plus(
        this.calcDebtAmount(tokenRate, notPayedOverDeadline),
      );
    }
    return debtInUSD;
  }

  async checkPayableWarning(
    guideName: string,
    histories: PayablesAllType[],
  ): Promise<string> {
    const notPayedWarning = _.filter(
      histories,
      (el) => el.notPayedPeriod > PAYABLE_WARNING,
    );
    if (_.isEmpty(notPayedWarning)) {
      return this.campaignRedisClient.deleteKey(
        `${REDIS_KEY.CAMPAIGN_SUSPEND_WARNING}${guideName}`,
      );
    }
    return this.campaignRedisClient.set(
      `${REDIS_KEY.CAMPAIGN_SUSPEND_WARNING}${guideName}`,
      '',
    );
  }

  calcDebtAmount(tokenRate: number, histories: PayablesAllType[]): BigNumber {
    return _.reduce(
      histories,
      (acc, el) => acc.plus(el.payable),
      new BigNumber(0),
    );
  }

  async suspendCampaigns(guideName: string): Promise<void> {
    await this.campaignRepository.updateMany({
      filter: { guideName },
      update: { status: CAMPAIGN_STATUS.SUSPENDED },
    });
    await this.wobjectHelper.updateCampaignsCountForManyCampaigns(
      { guideName },
      CAMPAIGN_STATUS.SUSPENDED,
    );
  }

  async checkGuideForUnblock(guideName: string): Promise<void> {
    const campaign = await this.campaignRepository.findOneSuspended(guideName);
    if (!campaign) return;
    const guides: GuideAggType[] = await this.campaignRepository.aggregate({
      pipeline: [
        { $match: { guideName } },
        {
          $group: { _id: '$guideName', tokens: { $addToSet: '$payoutToken' } },
        },
        {
          $project: {
            _id: 0,
            guideName: '$_id',
            tokens: 1,
          },
        },
      ],
    });
    const [guide] = guides;

    const debt = await this.getGuideDebt(guide);
    if (debt.lt(PAYABLE_DEBT_MAX_USD)) {
      await this.unblockCampaigns(guide.guideName);
    }
  }

  async unblockCampaigns(guideName: string): Promise<void> {
    const campaigns = await this.campaignRepository.find({
      filter: { guideName, status: CAMPAIGN_STATUS.SUSPENDED },
    });
    for (const campaign of campaigns) {
      const status = this.getStatusAfterSuspend(campaign);
      await this.campaignRepository.updateOne({
        filter: { _id: campaign._id },
        update: { status },
      });
      await this.wobjectRepository.updateCampaignsCount(
        campaign._id.toString(),
        status,
        [campaign.requiredObject, ...campaign.objects],
      );
    }
  }

  getStatusAfterSuspend(campaign: CampaignDocumentType): string {
    if (campaign.deactivationPermlink) return CAMPAIGN_STATUS.INACTIVE;
    if (campaign.expiredAt < new Date()) return CAMPAIGN_STATUS.EXPIRED;
    if (campaign.activationPermlink) {
      const completedUsers = _.filter(
        campaign.users,
        (user) => user.createdAt > moment.utc().startOf('month').toDate(),
      );
      return campaign.budget - campaign.reward * completedUsers.length >
        campaign.reward
        ? CAMPAIGN_STATUS.ACTIVE
        : CAMPAIGN_STATUS.REACHED_LIMIT;
    }
    return CAMPAIGN_STATUS.PENDING;
  }
}
