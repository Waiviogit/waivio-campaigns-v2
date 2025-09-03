import { CampaignDocumentType } from '../../../../persistance/campaign/types';
import { PostDocumentType } from '../../../../persistance/post/types';

export interface ContestInterface {
  getContestParticipants(campaign: CampaignDocumentType): Promise<string[]>;
  getContestPosts(campaign: CampaignDocumentType): Promise<PostDocumentType[]>;
  getJudgeVotes(
    campaign: CampaignDocumentType,
    posts: PostDocumentType[],
  ): Promise<Map<string, number>>;
  startContest(_id: string): Promise<void>;
  listener(key: string): Promise<void>;
}
