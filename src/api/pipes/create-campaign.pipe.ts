import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  CreateContestObjectDto,
  CreateGiveawayDto,
  CreateGiveawayObjectDto,
  CreateReviewCampaignDto,
} from '../../common/dto/campaign/in';
import { CAMPAIGN_TYPE } from '../../common/constants';

export type CreateCampaignUnionDto =
  | CreateReviewCampaignDto
  | CreateContestObjectDto
  | CreateGiveawayDto
  | CreateGiveawayObjectDto;

interface CreateCampaignRequest {
  object?: {
    type?: string;
  };
  [key: string]: unknown;
}

@Injectable()
export class CreateCampaignPipe implements PipeTransform {
  transform(
    value: CreateCampaignRequest,
    metadata: ArgumentMetadata,
  ): CreateCampaignUnionDto {
    const type = value?.type;

    if (!type) {
      throw new BadRequestException('object.type is required');
    }

    switch (type) {
      case CAMPAIGN_TYPE.REVIEWS:
        return this.transformToCreateReviewDto(value);
      case CAMPAIGN_TYPE.CONTESTS_OBJECT:
        return this.transformToCreateContestDto(value);
      case CAMPAIGN_TYPE.MENTIONS:
        return this.transformToMentionsDto(value);
      case CAMPAIGN_TYPE.GIVEAWAYS:
        return this.transformToGiveawaysDto(value);
      case CAMPAIGN_TYPE.GIVEAWAYS_OBJECT:
        return this.transformToCreateObjectGiveawaysDto(value);

      default:
        throw new BadRequestException(`Unsupported campaign type: ${type}`);
    }
  }

  private transformToDto<T extends object>(
    value: CreateCampaignRequest,
    dtoClass: new () => T,
  ): T {
    const dto = plainToInstance(dtoClass, value, {
      // enableImplicitConversion: true,
    });

    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return dto;
  }

  private transformToCreateReviewDto(
    value: CreateCampaignRequest,
  ): CreateReviewCampaignDto {
    return this.transformToDto(value, CreateReviewCampaignDto);
  }

  private transformToCreateContestDto(
    value: CreateCampaignRequest,
  ): CreateContestObjectDto {
    return this.transformToDto(value, CreateContestObjectDto);
  }

  private transformToGiveawaysDto(
    value: CreateCampaignRequest,
  ): CreateGiveawayDto {
    return this.transformToDto(value, CreateGiveawayDto);
  }

  private transformToCreateObjectGiveawaysDto(
    value: CreateCampaignRequest,
  ): CreateGiveawayObjectDto {
    return this.transformToDto(value, CreateGiveawayObjectDto);
  }

  private transformToMentionsDto(
    value: CreateCampaignRequest,
  ): CreateReviewCampaignDto {
    return this.transformToDto(value, CreateReviewCampaignDto);
  }
}
