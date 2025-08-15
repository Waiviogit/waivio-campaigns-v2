import { PostDocumentType } from '../../../../persistance/post/types';

export type ContestWinnerType = {
  place: number;
  reward: number;
  post: PostDocumentType;
  votePercentage: number;
};
