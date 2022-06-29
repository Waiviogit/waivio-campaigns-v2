import { Inject } from '@nestjs/common';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  EXPIRED_CAMPAIGN_TYPE,
  REDIS_KEY,
  REDIS_PROVIDE,
  RESERVATION_STATUS,
} from '../../common/constants';
import { RedisClientInterface } from '../../services/redis/clients/interface';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { parseJSON } from '../../common/helpers';
import {
  CampaignExpiredListenerInterface,
  CampaignHelperInterface,
} from './interface';

export class CampaignExpiredListener
  implements CampaignExpiredListenerInterface
{
  constructor(
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async expireCampaign(_id: string): Promise<void> {
    await this.campaignRepository.updateOne({
      filter: { _id },
      update: { status: CAMPAIGN_STATUS.EXPIRED },
    });
  }

  async expireAssign(reservationPermlink: string): Promise<void> {
    const cachedInfo = await this.campaignRedisClient.get(
      `${REDIS_KEY.ASSIGN}${reservationPermlink}`,
    );
    if (!cachedInfo) return;
    const assignData = parseJSON(cachedInfo, null);
    if (!assignData) return;

    await this.campaignRepository.updateOne({
      filter: {
        activationPermlink: assignData.activationPermlink,
        users: {
          $elemMatch: {
            name: assignData.name,
            status: RESERVATION_STATUS.ASSIGNED,
            reservationPermlink: assignData.reservationPermlink,
          },
        },
      },
      update: { $set: { 'users.$.status': RESERVATION_STATUS.EXPIRED } },
    });
    await this.campaignRedisClient.deleteKey(
      `${REDIS_KEY.ASSIGN}${reservationPermlink}`,
    );
    await this.campaignHelper.checkOnHoldStatus(assignData.activationPermlink);
  }

  async listener(key: string): Promise<void> {
    const [, type, id] = key.split(':');
    switch (type) {
      case EXPIRED_CAMPAIGN_TYPE.CAMPAIGN:
        return this.expireCampaign(id);
      case EXPIRED_CAMPAIGN_TYPE.ASSIGN:
        return this.expireAssign(id);
      default:
        return;
    }
  }
}
