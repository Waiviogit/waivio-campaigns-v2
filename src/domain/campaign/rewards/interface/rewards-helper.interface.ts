import { CampaignDocumentType } from '../../../../persistance/campaign/types';
import { RewardsByRequiredType } from '../types';

export interface RewardsHelperInterface {
  fillUserReservations(
    params: FillUserReservationsInterface,
  ): Promise<RewardsByRequiredType[]>;
  getPayedForMain(campaigns: CampaignDocumentType[]): number;
  parseCoordinates(map: string): number[] | null;
  getDistance(first: number[], second: number[]): number;
}

export interface FillUserReservationsInterface {
  campaigns: CampaignDocumentType[];
  host: string;
  area?: number[];
  sort?: string;
  showFraud?: boolean;
}
