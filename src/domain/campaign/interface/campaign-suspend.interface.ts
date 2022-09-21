import { PayableWarningType } from '../types';

export interface CampaignSuspendInterface {
  startJob(): Promise<void>;
  checkGuideForUnblock(guideName: string): Promise<void>;
  payableWarning(guideName: string): Promise<PayableWarningType>;
}
