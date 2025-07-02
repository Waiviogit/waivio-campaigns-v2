import {
  GiveawayRequirements,
  UserRequirementsType,
} from '../../../persistance/campaign/types';
import { PostDocumentType } from '../../../persistance/post/types';

export interface ValidateGiveawayWinner {
  giveawayRequirements: GiveawayRequirements;
  post: PostDocumentType;
  winner: string;
  userRequirements: UserRequirementsType;
}

export interface GiveawayInterface {
  runGiveaway(_id: string): Promise<void>;
}
