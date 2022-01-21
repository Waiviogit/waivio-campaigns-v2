import { Campaign, CampaignSchema } from '../../database/waivio/schemas';

export const CONNECTION_MONGO = {
  WAIVIO: 'WAIVIO',
};

export const WAIVIO_MODELS = {
  CAMPAIGN: { name: Campaign.name, schema: CampaignSchema },
};
