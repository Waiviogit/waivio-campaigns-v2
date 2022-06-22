import { Controller, Get, Param, Query } from '@nestjs/common';
import { HostPipe } from '../pipes/host.pipe';
import { CustomHeaders } from '../../common/decorators';
import { RewardsService } from './rewards.service';
import {
  RewardsAllMainOutDto,
  RewardsByObjectOutDto,
  RewardsTabDto,
} from '../../common/dto/rewards/out';
import { RewardsControllerDoc } from './rewards.controller.doc';
import { RewardSponsorsDto } from '../../common/dto/rewards/out/reward-sponsors.dto';
import { RewardsAllInDto } from '../../common/dto/rewards/in';

@RewardsControllerDoc.main()
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('tab-type/:userName')
  @RewardsControllerDoc.getTabType()
  async getTabType(
    @Param('userName')
    userName: string,
  ): Promise<RewardsTabDto> {
    return this.rewardsService.getTabType(userName);
  }

  @Get('all')
  @RewardsControllerDoc.getAllRewards()
  async getAllRewards(
    @CustomHeaders(new HostPipe())
    host: string,
    @Query() rewardsAllInDto: RewardsAllInDto,
  ): Promise<RewardsAllMainOutDto> {
    return this.rewardsService.getAllRewards({
      ...rewardsAllInDto,
      host,
    });
  }

  @Get('eligible')
  @RewardsControllerDoc.getAllRewards()
  async getAllEligibleRewards(
    @CustomHeaders(new HostPipe())
    host: string,
    @Query() rewardsAllInDto: RewardsAllInDto,
  ): Promise<RewardsAllMainOutDto> {
    return this.rewardsService.getAllEligible({
      ...rewardsAllInDto,
      host,
    });
  }

  @Get('all/object/:requiredObject')
  @RewardsControllerDoc.getAllRewardsByRequiredObject()
  async getAllRewardsByRequiredObject(
    @Query() rewardsAllInDto: RewardsAllInDto,
    @CustomHeaders(new HostPipe())
    host: string,
    @Param('requiredObject')
    requiredObject: string,
  ): Promise<RewardsByObjectOutDto> {
    return this.rewardsService.getAllRewardsByRequiredObject({
      requiredObject,
      host,
      ...rewardsAllInDto,
    });
  }

  @Get('eligible/object/:requiredObject')
  @RewardsControllerDoc.getAllRewards()
  async getEligibleByObject(
    @CustomHeaders(new HostPipe())
    host: string,
    @Query() rewardsAllInDto: RewardsAllInDto,
  ): Promise<RewardsByObjectOutDto> {
    return this.rewardsService.getEligibleByObject({
      ...rewardsAllInDto,
      host,
    });
  }

  @Get('all/sponsors')
  @RewardsControllerDoc.getSponsors()
  async getAllSponsors(): Promise<RewardSponsorsDto> {
    return this.rewardsService.getSponsorsAll();
  }

  @Get('all/sponsors/object/:requiredObject')
  @RewardsControllerDoc.getSponsors()
  async getAllSponsorsByObject(
    @Param('requiredObject')
    requiredObject: string,
  ): Promise<RewardSponsorsDto> {
    return this.rewardsService.getSponsorsAll(requiredObject);
  }

  @Get('reserved/:userName')
  @RewardsControllerDoc.getAllRewards()
  async getReserved(
    @CustomHeaders(new HostPipe())
    host: string,
    @Query() rewardsAllInDto: RewardsAllInDto,
    @Param('userName')
    userName: string,
  ): Promise<RewardsByObjectOutDto> {
    return this.rewardsService.getReserved({
      ...rewardsAllInDto,
      host,
      userName,
    });
  }
}
