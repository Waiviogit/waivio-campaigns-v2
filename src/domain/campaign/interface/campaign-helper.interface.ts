import { ObjectId } from 'mongoose';

export interface CampaignHelperInterface {
  setExpireTTLCampaign(expiredAt: Date, _id: ObjectId): Promise<void>;
  deleteCampaignKey(key: string): Promise<void>;
}