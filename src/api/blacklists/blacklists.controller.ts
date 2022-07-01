import { Controller, Get, Param } from '@nestjs/common';
import { BlacklistsService } from './blacklists.service';
import { GetBlacklistsDto } from '../../common/dto/blacklists/out/get-blacklists.dto';
import { BlacklistsControllerDoc } from './blacklists.controller.doc';

@Controller('blacklists')
@BlacklistsControllerDoc.main()
export class BlacklistsController {
  constructor(private readonly blacklistsService: BlacklistsService) {}

  @Get(':user')
  @BlacklistsControllerDoc.getUserBlacklist()
  async getUserBlacklist(
    @Param('user') user: string,
  ): Promise<GetBlacklistsDto> {
    return this.blacklistsService.getUserBlacklist(user);
  }
}
