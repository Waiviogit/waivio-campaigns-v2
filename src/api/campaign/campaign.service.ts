import { Inject, Injectable } from '@nestjs/common';

import { CAMPAIGN_PROVIDE, USER_PROVIDE } from '../../common/constants';
import { CreateCampaignInterface } from '../../domain/campaign/interface/create-campaign.interface';
import { UserRepositoryInterface } from '../../persistance/user/interface';
import {
  CampaignServerException,
  UserForbiddenException,
  UserNotFoundException,
} from '../../common/exeptions';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { UpdateCampaignInterface } from '../../domain/campaign/interface/update-campaign.interface';
import { DeleteCampaignInterface } from '../../domain/campaign/interface/delete-campaign.interface';
import {
  CampaignDocumentType,
  CreateCampaignType,
  DeleteCampaignType,
  UpdateCampaignType,
} from '../../persistance/campaign/types';

@Injectable()
export class CampaignService {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.CREATE_CAMPAIGN)
    private readonly createCampaign: CreateCampaignInterface,
    @Inject(CAMPAIGN_PROVIDE.UPDATE_CAMPAIGN)
    private readonly updateCampaign: UpdateCampaignInterface,
    @Inject(CAMPAIGN_PROVIDE.DELETE_CAMPAIGN)
    private readonly deleteCampaign: DeleteCampaignInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
  ) {}

  async create(
    createCampaignDto: CreateCampaignType,
  ): Promise<CampaignDocumentType> {
    const user = await this.userRepository.findOne({
      filter: { name: createCampaignDto.guideName },
      projection: { auth: 1 },
    });
    if (!user) throw new UserNotFoundException();
    if (user?.auth?.provider) throw new UserForbiddenException();

    const campaign = await this.createCampaign.create(createCampaignDto);
    if (!campaign) throw new CampaignServerException();
    return campaign;
  }

  async update(
    updateCampaignDto: UpdateCampaignType,
  ): Promise<CampaignDocumentType> {
    const campaign = await this.updateCampaign.update(updateCampaignDto);
    if (!campaign) throw new CampaignServerException();
    return campaign;
  }

  async delete(
    deleteCampaignDto: DeleteCampaignType,
  ): Promise<CampaignDocumentType> {
    const campaign = await this.deleteCampaign.delete(deleteCampaignDto);
    if (!campaign) throw new CampaignServerException();
    return campaign;
  }
}
