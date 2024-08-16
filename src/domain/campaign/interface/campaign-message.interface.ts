export interface createMessageThreadInterface {
  activationPermlink: string;
  reservationPermlink: string;
  author: string;
  permlink: string;
}

export interface CampaignMessageInterface {
  createMessageThread({
    activationPermlink,
    author,
    permlink,
    reservationPermlink,
  }: createMessageThreadInterface): Promise<void>;
}
