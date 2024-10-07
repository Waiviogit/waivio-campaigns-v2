import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_PROVIDE } from '../../common/constants';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import {
  CampaignMessageInterface,
  createMessageThreadInterface,
} from './interface';

@Injectable()
export class CampaignMessages implements CampaignMessageInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
  ) {}

  async createMessageThread({
    activationPermlink,
    author,
    permlink,
    reservationPermlink,
  }: createMessageThreadInterface): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        activationPermlink,
        users: { $elemMatch: { reservationPermlink } },
      },
      projection: {
        'users.$': 1,
        guideName: 1,
        name: 1,
      },
    });
    if (!campaign) return;

    const [user] = campaign.users;

    if (user?.messagesPermlink) return;

    await this.campaignRepository.updateOne({
      filter: {
        activationPermlink,
        users: {
          $elemMatch: {
            reservationPermlink,
          },
        },
      },
      update: {
        'users.$.messagesPermlink': `${author}/${permlink}`,
      },
    });
  }
}
