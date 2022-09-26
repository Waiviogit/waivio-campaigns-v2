import { Inject, Injectable } from '@nestjs/common';
import { BlacklistParseHiveCustomJson } from './types';
import {
  BLACKLIST_COMMAND,
  BLACKLIST_PROVIDE,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUSES_TO_UPDATE_BLACKLIST,
  USER_PROVIDE,
} from '../../common/constants';
import { BlacklistRepositoryInterface } from '../../persistance/blacklist/interface';

import { UserRepositoryInterface } from '../../persistance/user/interface';
import * as _ from 'lodash';
import {
  BlacklistHelperInterface,
  BlacklistParserInterface,
} from './interface';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';

@Injectable()
export class BlacklistParser implements BlacklistParserInterface {
  constructor(
    @Inject(BLACKLIST_PROVIDE.REPOSITORY)
    private readonly blacklistRepository: BlacklistRepositoryInterface,
    @Inject(BLACKLIST_PROVIDE.HELPER)
    private readonly blacklistHelper: BlacklistHelperInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
  ) {}

  async parseHiveCustomJson({
    user,
    names,
    type,
  }: BlacklistParseHiveCustomJson): Promise<void> {
    if (!Array.isArray(names)) return;

    switch (type) {
      case BLACKLIST_COMMAND.REMOVE_USERS_FROM_BLACK_LIST:
        await this.removeUsersFromBlacklist(user, names);
        break;
      case BLACKLIST_COMMAND.REMOVE_USERS_FROM_WHITE_LIST:
        await this.removeUsersFromWhiteList(user, names);
        break;
      case BLACKLIST_COMMAND.ADD_USERS_TO_BLACK_LIST:
        await this.addUsersFromBlacklist(user, names);
        break;
      case BLACKLIST_COMMAND.ADD_USERS_TO_WHITE_LIST:
        await this.addUsersToWhiteList(user, names);
        break;
      case BLACKLIST_COMMAND.UNFOLLOW_ANOTHER_BLACK_LIST:
        await this.unfollowAnotherBlacklist(user, names);
        break;
      case BLACKLIST_COMMAND.FOLLOW_ANOTHER_BLACK_LIST:
        await this.followAnotherBlacklist(user, names);
        break;
      default:
        return;
    }
  }

  async addUsersFromBlacklist(user: string, names: string[]): Promise<void> {
    await this.blacklistRepository.updateOne({
      filter: { user },
      update: {
        $addToSet: { blackList: { $each: names } },
        $pull: { whiteList: { $in: names } },
      },
    });

    await this.campaignRepository.updateMany({
      filter: {
        guideName: user,
        status: { $in: CAMPAIGN_STATUSES_TO_UPDATE_BLACKLIST },
      },
      update: {
        $addToSet: {
          blacklistUsers: { $each: names },
        },
        $pull: { whitelistUsers: { $in: names } },
      },
    });
    const followers = await this.blacklistRepository.find({
      filter: { followLists: user },
      projection: { user: 1 },
    });

    for (const follower of followers) {
      await this.campaignRepository.updateMany({
        filter: {
          guideName: follower.user,
          status: { $in: CAMPAIGN_STATUSES_TO_UPDATE_BLACKLIST },
        },
        update: { $addToSet: { blacklistUsers: { $each: names } } },
      });
    }
  }

  async removeUsersFromBlacklist(user: string, names: string[]): Promise<void> {
    await this.blacklistRepository.updateOne({
      filter: { user },
      update: { $pull: { blackList: { $in: names } } },
    });

    await this.campaignRepository.updateMany({
      filter: {
        guideName: user,
        status: { $in: CAMPAIGN_STATUSES_TO_UPDATE_BLACKLIST },
      },
      update: { $pull: { blacklistUsers: { $in: names } } },
    });

    const followers = await this.blacklistRepository.find({
      filter: { followLists: user },
      projection: { user: 1 },
    });

    for (const follower of followers) {
      const { blacklist: followerBlacklist } =
        await this.blacklistHelper.getBlacklist(follower.user);
      const usersToPull = _.difference(names, followerBlacklist);
      await this.campaignRepository.updateMany({
        filter: {
          guideName: follower.user,
          status: { $in: CAMPAIGN_STATUSES_TO_UPDATE_BLACKLIST },
        },
        update: { $pull: { blacklistUsers: { $in: usersToPull } } },
      });
    }
  }

  async removeUsersFromWhiteList(user: string, names: string[]): Promise<void> {
    await this.blacklistRepository.updateOne({
      filter: { user },
      update: {
        $pull: { whiteList: { $in: names } },
      },
    });

    await this.campaignRepository.updateMany({
      filter: {
        guideName: user,
        status: { $in: CAMPAIGN_STATUSES_TO_UPDATE_BLACKLIST },
      },
      update: { $pull: { whitelistUsers: { $in: names } } },
    });
  }

  async addUsersToWhiteList(user: string, names: string[]): Promise<void> {
    await this.blacklistRepository.updateOne({
      filter: { user },
      update: {
        $addToSet: { whiteList: { $each: names } },
      },
    });

    const { whitelist } = await this.blacklistHelper.getBlacklist(user);
    await this.campaignRepository.updateMany({
      filter: {
        guideName: user,
        status: { $in: CAMPAIGN_STATUSES_TO_UPDATE_BLACKLIST },
      },
      update: {
        $addToSet: {
          whitelistUsers: { $each: whitelist },
        },
      },
    });
  }

  async unfollowAnotherBlacklist(user: string, names: string[]): Promise<void> {
    const userNames = await this.userRepository.findByNames(names);
    if (!userNames || !userNames.length) return;
    await this.blacklistRepository.updateOne({
      filter: { user },
      update: { $pull: { followLists: { $in: userNames } } },
    });
    const { blacklist: myBlacklist } = await this.blacklistHelper.getBlacklist(
      user,
    );
    const unfollowedBlacklist =
      await this.blacklistHelper.getUsersOwnBlacklists(userNames);

    const usersToPull = _.difference(unfollowedBlacklist, myBlacklist);

    await this.campaignRepository.updateMany({
      filter: {
        guideName: user,
        status: { $in: CAMPAIGN_STATUSES_TO_UPDATE_BLACKLIST },
      },
      update: { $pull: { blacklistUsers: { $in: usersToPull } } },
    });
  }

  async followAnotherBlacklist(user: string, names: string[]): Promise<void> {
    const userNames = await this.userRepository.findByNames(names);
    if (!userNames || !userNames.length) return;
    await this.blacklistRepository.updateOne({
      filter: { user },
      update: { $addToSet: { followLists: { $each: userNames } } },
    });
    const { blacklist } = await this.blacklistHelper.getBlacklist(user);

    await this.campaignRepository.updateMany({
      filter: {
        guideName: user,
        status: { $in: CAMPAIGN_STATUSES_TO_UPDATE_BLACKLIST },
      },
      update: { $addToSet: { blacklistUsers: { $each: blacklist } } },
    });
  }
}
