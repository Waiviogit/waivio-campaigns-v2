import { GetBlacklistType } from '../types';

export interface BlacklistHelperInterface {
  getBlacklist(user: string): Promise<GetBlacklistType>;

  getUsersOwnBlacklists(users: string[]): Promise<string[]>;
}
