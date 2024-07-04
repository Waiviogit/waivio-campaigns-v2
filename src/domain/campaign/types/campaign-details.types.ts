import { UserCampaignType } from '../../../persistance/user/types';
import { ProcessedWobjectType } from '../../wobject/types';
import {
  ReviewRequirementsType,
  UserRequirementsType,
} from '../../../persistance/campaign/types';

export type getCampaignRequirementsType = {
  _id: string;
  requiredObject: UserCampaignType | ProcessedWobjectType;
  secondaryObject: UserCampaignType | ProcessedWobjectType;
  app: string;
  name: string;
  guideName: string;
  requirements: ReviewRequirementsType;
  userRequirements: UserRequirementsType;
  type: string;
};
