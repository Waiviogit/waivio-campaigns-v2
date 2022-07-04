import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { CAMPAIGN_PROVIDE, USER_PROVIDE } from '../../../common/constants';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import {
  CampaignCustomException,
  CampaignServerException,
  UserForbiddenException,
  UserNotFoundException,
} from '../../../common/exeptions';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  CampaignDocumentType,
  CreateCampaignType,
  DeleteCampaignType,
  UpdateCampaignType,
} from '../../../persistance/campaign/types';
import {
  CampaignActivationInterface,
  CampaignDeactivationInterface,
  DeleteCampaignInterface,
  UpdateCampaignInterface,
  CreateCampaignInterface,
} from '../../../domain/campaign/interface';
import {
  ActivateCampaignType,
  DeactivateCampaignType,
} from '../../../domain/campaign/types';

@Injectable()
export class CampaignService {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.CREATE_CAMPAIGN)
    private readonly createCampaign: CreateCampaignInterface,
    @Inject(CAMPAIGN_PROVIDE.UPDATE_CAMPAIGN)
    private readonly updateCampaign: UpdateCampaignInterface,
    @Inject(CAMPAIGN_PROVIDE.DELETE_CAMPAIGN)
    private readonly deleteCampaign: DeleteCampaignInterface,
    @Inject(CAMPAIGN_PROVIDE.ACTIVATE_CAMPAIGN)
    private readonly campaignActivation: CampaignActivationInterface,
    @Inject(CAMPAIGN_PROVIDE.DEACTIVATE_CAMPAIGN)
    private readonly campaignDeactivation: CampaignDeactivationInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
  ) {}

  async create(
    createCampaignDto: Omit<CreateCampaignType, 'rewardInUSD'>,
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

  async validateActivation(
    params: ActivateCampaignType,
  ): Promise<{ isValid: boolean }> {
    const { isValid, message } =
      await this.campaignActivation.validateActivation(params);
    if (!isValid) {
      throw new CampaignCustomException(
        message,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return { isValid };
  }

  async validateDeactivation(
    params: DeactivateCampaignType,
  ): Promise<{ isValid: boolean }> {
    const { isValid, message } =
      await this.campaignDeactivation.validateDeactivation(params);
    if (!isValid) {
      throw new CampaignCustomException(
        message,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return { isValid };
  }

  async getCampaignById(_id: string): Promise<CampaignDocumentType> {
    const campaign = await this.campaignRepository.findCampaignById(_id);
    return campaign;
  }
}
