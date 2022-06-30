import { Inject, Injectable } from '@nestjs/common';
import { BlacklistRepositoryInterface } from '../../persistance/blacklist/interface';
import { BLACKLIST_PROVIDE } from '../../common/constants';
import { BlacklistHelperInterface } from './interface';
import { GetBlacklistType } from './types';

@Injectable()
export class BlacklistHelper implements BlacklistHelperInterface {
  constructor(
    @Inject(BLACKLIST_PROVIDE.REPOSITORY)
    private readonly blacklistRepository: BlacklistRepositoryInterface,
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
      blacklist,
      whitelist: data.whiteList,
    };
  }
}
