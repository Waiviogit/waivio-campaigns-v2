import {
  DeactivateCampaignType,
  validateActivationDeactivationType,
} from '../types';

export interface CampaignDeactivationInterface {
  deactivate({
    guideName,
    deactivation_permlink,
    activation_permlink,
  }: DeactivateCampaignType): Promise<void>;
  validateDeactivation({
    guideName,
    deactivation_permlink,
    activation_permlink,
  }: DeactivateCampaignType): Promise<validateActivationDeactivationType>;
}
