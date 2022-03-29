import { OmitType } from '@nestjs/swagger';
import { CampaignDto } from '../campaign.dto';

export class CreateCampaignDto extends OmitType(CampaignDto, ['_id']) {}
