import { PickType } from '@nestjs/swagger';
import { CampaignDto } from '../campaign.dto';

export class DeleteCampaignDto extends PickType(CampaignDto, ['_id']) {}
