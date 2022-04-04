import {
  ActivateCampaignType,
  validateActivationResponseType,
} from '../types/campaign-activation.types';

export interface CampaignActivationInterface {
  activate({ _id, guideName, permlink }: ActivateCampaignType): Promise<void>;
  validateActivation({
    _id,
    guideName,
    permlink,
  }: ActivateCampaignType): Promise<validateActivationResponseType>;
}
