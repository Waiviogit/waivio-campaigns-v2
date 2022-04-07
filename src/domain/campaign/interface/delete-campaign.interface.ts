import {
  CampaignDocumentType,
  DeleteCampaignType,
} from '../../../persistance/campaign/types';

export interface DeleteCampaignInterface {
  delete({ _id }: DeleteCampaignType): Promise<CampaignDocumentType>;
}
