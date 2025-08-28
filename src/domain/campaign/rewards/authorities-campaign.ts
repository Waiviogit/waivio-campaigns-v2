import { Inject, Injectable } from '@nestjs/common';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  REWARDS_PROVIDE,
  USER_PROVIDE,
  WOBJECT_PROVIDE,
} from '../../../common/constants';
import { WobjectRepositoryInterface } from '../../../persistance/wobject/interface';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import { AuthoritiesCampaignInterface, RewardsAllInterface } from './interface';
import { UserRepositoryInterface } from '../../../persistance/user/interface';

@Injectable()
export class AuthoritiesCampaign implements AuthoritiesCampaignInterface {
  constructor(
    @Inject(WOBJECT_PROVIDE.REPOSITORY)
    private readonly wobjectRepository: WobjectRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(REWARDS_PROVIDE.ALL)
    private readonly rewardsAll: RewardsAllInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async handleUpdateEvent(
    authorPermlink: string,
    author: string,
    permlink: string,
  ): Promise<void> {
    const field = await this.wobjectRepository.getField(
      authorPermlink,
      author,
      permlink,
    );
    if (!field) return;
    const user = await this.userRepository.findOne({
      filter: { name: field.creator },
      projection: { count_posts: 1, followers_count: 1, wobjects_weight: 1 },
    });

    if (!user) return;
    const campaign = await this.campaignRepository.findOne({
      filter: {
        status: CAMPAIGN_STATUS.ACTIVE,
        type: CAMPAIGN_TYPE.AUTHORITIES,
        $or: [
          {
            requiredObject: authorPermlink,
          },
          {
            objects: authorPermlink,
          },
        ],
        ...(await this.rewardsAll.getEligiblePipe({
          userName: field.creator,
          user,
        })),
      },
    });
    if (!campaign) return;
    if (
      campaign.objects.length === 1 &&
      campaign.requiredObject === campaign.objects[0]
    ) {
      ///campaign complete

      return;
    }

    if (campaign.requiredObject === authorPermlink) {
      const object = await this.campaignRepository.findOne({
        filter: {
          author_permlink: { $in: campaign.objects },
          'authority.administrative': user.name,
        },
      });
      if (object) {
        ///completed
      }
      return;
    }
    //here we need to check if user has authority on requiredObject
    const object = await this.campaignRepository.findOne({
      filter: {
        author_permlink: authorPermlink,
        'authority.administrative': user.name,
      },
    });

    if (object) {
      //completed
    }
  }
}
