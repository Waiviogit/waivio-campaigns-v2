import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { BlacklistRepositoryInterface } from '../../persistance/blacklist/interface';
import { BLACKLIST_PROVIDE, USER_PROVIDE } from '../../common/constants';
import { BlacklistHelperInterface } from './interface';
import { GetApiBlacklistType, GetBlacklistType } from './types';
import { UserRepositoryInterface } from '../../persistance/user/interface';

@Injectable()
export class BlacklistHelper implements BlacklistHelperInterface {
  constructor(
    @Inject(BLACKLIST_PROVIDE.REPOSITORY)
    private readonly blacklistRepository: BlacklistRepositoryInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async getBlacklist(user: string): Promise<GetBlacklistType> {
    const data = await this.blacklistRepository.findOne({
      filter: { user },
    });
    const blacklist = [...data.blackList];
    for (const item of data.followLists) {
      blacklist.push(...item.blackList);
    }
    return {
      blacklist: _.uniq(blacklist),
      whitelist: data.whiteList,
    };
  }

  async getUsersOwnBlacklists(users: string[]): Promise<string[]> {
    const blacklist = [];
    const data = await this.blacklistRepository.find({
      filter: { user: { $in: users } },
    });

    for (const item of data) {
      blacklist.push(...item.blackList);
    }

    return _.uniq(blacklist);
  }

  async getApiBlacklist(user: string): Promise<GetApiBlacklistType> {
    const [blackList] = await this.blacklistRepository.find({
      filter: { user },
    });
    if (!blackList) {
      const currentUser = await this.userRepository.findOne({
        filter: { name: user },
        projection: { name: 1, json_metadata: 1, wobjects_weight: 1 },
      });
      return {
        user: currentUser,
        blackList: [],
        whiteList: [],
        followLists: [],
      };
    }
    const userNames = [
      blackList.user,
      ...blackList.followLists,
      ...blackList.whiteList,
      ...blackList.blackList,
    ];
    const users = await this.userRepository.find({
      filter: { name: { $in: userNames } },
      projection: { name: 1, json_metadata: 1, wobjects_weight: 1 },
    });
    console.log();
    return {
      user: users.find((user) => user.name === blackList.user),
      blackList: _.compact(
        blackList.blackList.map((name) => {
          const currentUser = users.find((user) => user.name === name);
          if (currentUser) return currentUser;
        }),
      ),
      whiteList: _.compact(
        blackList.whiteList.map((name) => {
          const currentUser = users.find((user) => user.name === name);
          if (currentUser) return currentUser;
        }),
      ),
      followLists: _.compact(
        blackList.followLists.map((name) => {
          const currentUser = users.find((user) => user.name === name);
          if (currentUser) return currentUser;
        }),
      ),
    };
  }
}
