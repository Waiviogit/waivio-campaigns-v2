import { Document } from 'mongoose';

import { Blacklist } from '../blacklist.schema';

export type BlacklistFindOneTypeOut = Blacklist & {
  followLists: Blacklist[];
  followListsFollowLists: Blacklist[];
} & Document;
