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
    if (!data) {
      return {
        blacklist: [],
        whitelist: [],
      };
    }
    const blacklist = [...data.blackList];
    for (const item of data.followLists) {
      blacklist.push(...item.blackList);
    }

    const filteredBlacklist = _.filter(
      blacklist,
      (el) => !_.some(data.whiteList, (w) => w === el),
    );

    return {
      blacklist: _.uniq(filteredBlacklist),
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
      return {
        blackList: [],
        whiteList: [],
        followLists: [],
      };
    }

    const followLists = await this.blacklistRepository.find({
      filter: { user: { $in: blackList.followLists } },
    });

    for (const followList of followLists) {
      followList.blackList = _.filter(
        followList.blackList,
        (el) => !_.includes(blackList.blackList, el),
      );
    }

    const userNames = [
      ...blackList.followLists,
      ...blackList.whiteList,
      ...blackList.blackList,
      ..._.flatten(followLists.map((list) => list.blackList)),
    ];

    const users = await this.userRepository.find({
      filter: { name: { $in: _.compact(_.uniq(userNames)) } },
      projection: { name: 1, json_metadata: 1, wobjects_weight: 1 },
    });

    const blackListResponse = [
      ..._.compact(
        blackList.blackList.map((name) => {
          const currentUser = users.find((user) => user.name === name);
          if (currentUser) return currentUser;
        }),
      ),
      ..._.compact(
        _.reduce(
          followLists,
          (acc, list) => {
            const guidesList = list.blackList.map((name) => {
              const currentUser = users.find((user) => user.name === name);
              if (currentUser)
                return {
                  ...currentUser,
                  guideName: list.user,
                };
            });
            acc.push(...guidesList);
            return acc;
          },
          [],
        ),
      ),
    ];

    return {
      blackList: blackListResponse,
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
