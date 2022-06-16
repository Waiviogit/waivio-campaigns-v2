import { Controller, Get, Param, Query } from '@nestjs/common';
import { HostPipe } from '../pipes/host.pipe';
import { CustomHeaders } from '../../common/decorators';
import { RewardsService } from './rewards.service';
import {
  RewardsAllMainOutDto,
  RewardsByObjectOutDto,
} from '../../common/dto/rewards/out';
import { RewardsControllerDoc } from './rewards.controller.doc';
import { SkipLimitDto } from '../../common/dto/skip-limit.dto';

@RewardsControllerDoc.main()
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('all')
  @RewardsControllerDoc.getAllRewards()
  async getAllRewards(
    @CustomHeaders(new HostPipe())
    host: string,
    @Query() skipLimitDto: SkipLimitDto,
  ): Promise<RewardsAllMainOutDto> {
    return this.rewardsService.getAllRewards({
      ...skipLimitDto,
      host,
    });
  }

  @Get('all/:requiredObject')
  @RewardsControllerDoc.getAllRewardsByRequiredObject()
  async getAllRewardsByRequiredObject(
    @Query() skipLimitDto: SkipLimitDto,
    @CustomHeaders(new HostPipe())
    host: string,
    @Param('requiredObject')
    requiredObject: string,
  ): Promise<RewardsByObjectOutDto> {
    return this.rewardsService.getAllRewardsByRequiredObject({
      requiredObject,
      host,
      ...skipLimitDto,
    });
  }
}
