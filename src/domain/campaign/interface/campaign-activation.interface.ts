import {
  ActivateCampaignType,
  validateActivationDeactivationType,
} from '../types';

export interface CampaignActivationInterface {
  activate({ _id, guideName, permlink }: ActivateCampaignType): Promise<void>;
  validateActivation({
    _id,
    guideName,
    permlink,
  }: ActivateCampaignType): Promise<validateActivationDeactivationType>;
}
