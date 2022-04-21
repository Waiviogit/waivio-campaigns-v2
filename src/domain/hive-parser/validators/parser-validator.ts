import { validate, ValidatorOptions } from 'class-validator';
import * as _ from 'lodash';
import { ActivateCampaignDto } from '../../../common/dto/campaign/in';

class ParserValidator {
  async validateCampaignActivation(
    _id: string,
    guideName: string,
    permlink: string,
  ): Promise<object> {
    const activateCampaignDto = new ActivateCampaignDto();
    activateCampaignDto._id = _id;
    activateCampaignDto.guideName = guideName;
    activateCampaignDto.permlink = permlink;
    return this.validateParams(activateCampaignDto);
  }

  private async validateParams(
    dto: object,
    options?: ValidatorOptions,
  ): Promise<object> {
    const errors = await validate(dto, options);
    //TODO send notification to telegram
    if (_.isEmpty(errors)) return dto;
  }
}

export const parserValidator = new ParserValidator();
