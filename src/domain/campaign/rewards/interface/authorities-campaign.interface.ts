export interface AuthoritiesCampaignInterface {
  handleUpdateEvent(
    authorPermlink: string,
    author: string,
    permlink: string,
  ): Promise<void>;
}
