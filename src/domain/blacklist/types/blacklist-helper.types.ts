export type GetBlacklistType = {
  blacklist: string[];
  whitelist: string[];
};

export type GetApiBlacklistType = {
  blackList: BlacklistUserType[];
  whiteList: BlacklistUserType[];
  followLists: BlacklistUserType[];
};

export type BlacklistUserType = {
  name: string;
  json_metadata: string;
  wobjects_weight: number;
};
