import { GuideAggType, PayableWarningType } from '../types';
import BigNumber from 'bignumber.js';

export interface CampaignSuspendInterface {
  startJob(): Promise<void>;
  checkGuideForUnblock(guideName: string): Promise<void>;
  payableWarning(guideName: string): Promise<PayableWarningType>;
  getGuideDebt(guide: GuideAggType): Promise<BigNumber>;
}
