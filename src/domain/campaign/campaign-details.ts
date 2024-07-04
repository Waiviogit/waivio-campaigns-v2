import { Inject } from '@nestjs/common';
import {
  CAMPAIGN_PROVIDE,
  REWARDS_PROVIDE,
  USER_PROVIDE,
  WOBJECT_PROVIDE,
} from '../../common/constants';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { WobjectRepositoryInterface } from '../../persistance/wobject/interface';
import { WobjectHelperInterface } from '../wobject/interface';
import { UserRepositoryInterface } from '../../persistance/user/interface';
import { RewardsHelperInterface } from './rewards/interface';
import {
  CampaignDetailsInterface,
  getCampaignRequirementsInterface,
} from './interface/campaign-details.interface';
import { UserCampaignType } from '../../persistance/user/types';
import { ProcessedWobjectType } from '../wobject/types';
import { getCampaignRequirementsType } from './types/campaign-details.types';

export class CampaignDetails implements CampaignDetailsInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.REPOSITORY)
    private readonly wobjectRepository: WobjectRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(REWARDS_PROVIDE.HELPER)
    private readonly rewardsHelper: RewardsHelperInterface,
  ) {}

  async getCampaignRequirements({
    campaignId,
    object,
    host,
  }: getCampaignRequirementsInterface): Promise<getCampaignRequirementsType> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        _id: campaignId,
        objects: object,
      },
      projection: {
        requiredObject: 1,
        requirements: 1,
        guideName: 1,
        name: 1,
        app: 1,
        type: 1,
      },
    });

    if (!campaign) {
      return;
    }
    const { requiredObject: requiredObjectKey } = campaign;

    const [campaignUsers, objects] = await Promise.all([
      this.userRepository.findCampaignsUsers(
        this.rewardsHelper.getCampaignUsersFromArray([
          object,
          requiredObjectKey,
        ]),
      ),
      this.wobjectHelper.getWobjectsForCampaigns({
        links: this.rewardsHelper.filterObjectLinks([
          object,
          requiredObjectKey,
        ]),
        host,
      }),
    ]);

    const findUserOrObject = (
      item: string,
      isUser: boolean,
    ): UserCampaignType | ProcessedWobjectType =>
      isUser
        ? campaignUsers.find(
            (u) => u.name === this.rewardsHelper.extractUsername(item),
          )
        : objects.find((o) => o.author_permlink === item);

    const isUser = (item: string): boolean => item.startsWith('@');

    const secondaryObject = findUserOrObject(object, isUser(object));
    const requiredObject = findUserOrObject(
      requiredObjectKey,
      isUser(requiredObjectKey),
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
      type: campaign.type,
    };
  }
}
