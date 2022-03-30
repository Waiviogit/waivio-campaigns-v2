import { Inject, Injectable } from '@nestjs/common';
import { CreateCampaignDto } from '../../common/dto/in';
import { Campaign } from '../../persistance/campaign/campaign.schema';
import { CAMPAIGN_PROVIDE, USER_PROVIDE } from '../../common/constants';
import { CreateCampaignInterface } from '../../domain/campaign/interface/create-campaign.interface';
import { UserRepositoryInterface } from '../../persistance/user/interface/user.repository.interface';
import {
  UserForbiddenException,
  UserNotFoundException,
} from '../../common/exeptions';

@Injectable()
export class CampaignService {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.CREATE_CAMPAIGN)
    private readonly createCampaign: CreateCampaignInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const user = await this.userRepository.findOne({
      filter: { name: createCampaignDto.guideName },
      projection: { auth: 1 },
    });
    if (!user) throw new UserNotFoundException();
    if (user?.auth?.provider) throw new UserForbiddenException();

    return this.createCampaign.create(createCampaignDto);
  }
}
