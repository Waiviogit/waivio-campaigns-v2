export type ActivateCampaignType = {
  _id: string;
  guideName: string;
  permlink: string;
};

export type validateActivationResponseType = {
  isValid: boolean;
  message: string;
};
