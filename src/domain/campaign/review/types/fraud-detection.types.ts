import { ReviewCampaignType } from './create-review.types';

export type handleImagesType = {
  photoWidth?: number[];
  exifCounter: number;
  photoDates?: number[];
  models?: string[];
  latitudeArr?: number[];
  longitudeArr?: number[];
};

export type GetMapType = {
  latitude?: number;
  longitude?: number;
};

export type DetectFraudType = {
  campaign: ReviewCampaignType;
  images: string[];
};

export type FraudType = {
  fraud: boolean;
  fraudCodes: string[];
};
