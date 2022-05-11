export interface CampaignSuspendInterface {
  startJob(): Promise<void>;
  checkGuideForUnblock(guideName: string): Promise<void>;
}
