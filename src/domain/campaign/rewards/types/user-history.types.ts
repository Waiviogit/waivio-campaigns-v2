export type FilterUserHistoryAggType = {
  guideNames: string[];
};

export type FilterUserHistoryType = {
  statuses: string[];
  guideNames: string[];
};

export type ObjectsFollowingType = {
  authorPermlink: string;
  follow: boolean;
};

export type UserFollowingType = {
  name: string;
  follow: boolean;
};

export type UserAndObjectFollowing = {
  users: UserFollowingType[];
  objects: ObjectsFollowingType[];
};
