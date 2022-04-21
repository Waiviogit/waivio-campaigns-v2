import {
  DeactivateCampaignType,
  validateActivationDeactivationType,
} from '../types';

export interface CampaignDeactivationInterface {
  deactivate({
    guideName,
    deactivationPermlink,
    activationPermlink,
  }: DeactivateCampaignType): Promise<void>;
  validateDeactivation({
    guideName,
    deactivationPermlink,
    activationPermlink,
  }: DeactivateCampaignType): Promise<validateActivationDeactivationType>;
}
