import { DeleteCampaignDto } from '../../../common/dto/in';
import { Campaign } from '../../../persistance/campaign/campaign.schema';

export interface DeleteCampaignInterface {
  delete({ _id }: DeleteCampaignDto): Promise<Campaign>;
}
