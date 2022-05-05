import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  RewardsAllInDto,
  RewardsAllMainInDto,
} from '../../common/dto/rewards/in';
import { HostPipe } from '../pipes/host.pipe';
import { CustomHeaders } from '../../common/decorators';
import { RewardsService } from './rewards.service';
import {
  RewardAllMainOutDto,
  RewardAllOutDto,
} from '../../common/dto/rewards/out';
import { RewardsControllerDoc } from './rewards.controller.doc';

@RewardsControllerDoc.main()
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post('all')
  @RewardsControllerDoc.getAllRewards()
  async getAllRewards(
    @CustomHeaders(new HostPipe())
    host: string,
    @Body()
    body: RewardsAllMainInDto,
  ): Promise<RewardAllMainOutDto[]> {
    return this.rewardsService.getAllRewards({
      ...body,
      host,
    });
  }

  @Post('all/:requiredObject')
  @RewardsControllerDoc.getAllRewardsByRequiredObject()
  async getAllRewardsByRequiredObject(
    @Body()
    body: RewardsAllInDto,
    @CustomHeaders(new HostPipe())
    host: string,
    @Param('requiredObject')
    requiredObject: string,
  ): Promise<RewardAllOutDto[]> {
    return this.rewardsService.getAllRewardsByRequiredObject({
      requiredObject,
      host,
      ...body,
    });
  }
}
