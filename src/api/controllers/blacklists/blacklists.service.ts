import { Inject, Injectable } from '@nestjs/common';
import { GetApiBlacklistType } from '../../../domain/blacklist/types';
import { BLACKLIST_PROVIDE } from '../../../common/constants';
import { BlacklistHelperInterface } from '../../../domain/blacklist/interface';

@Injectable()
export class BlacklistsService {
  constructor(
    @Inject(BLACKLIST_PROVIDE.HELPER)
    private readonly blacklistHelper: BlacklistHelperInterface,
  ) {}

  async getUserBlacklist(user: string): Promise<GetApiBlacklistType> {
    const yo = await this.blacklistHelper.getApiBlacklist(user);
    return yo;
  }
}
