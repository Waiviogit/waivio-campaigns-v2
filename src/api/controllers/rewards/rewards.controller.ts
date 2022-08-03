import { Controller, Get, Param, Query } from '@nestjs/common';
import { HostPipe } from '../../pipes/host.pipe';
import { CustomHeaders } from '../../../common/decorators';
import { RewardsService } from './rewards.service';
import {
  RewardsAllMainOutDto,
  RewardsByObjectOutDto,
  RewardsCanReserveOutDto,
  RewardsTabDto,
} from '../../../common/dto/rewards/out';
import { RewardsControllerDoc } from './rewards.controller.doc';
import { RewardSponsorsDto } from '../../../common/dto/rewards/out/reward-sponsors.dto';
import {
  RewardsAllInDto,
  RewardsCanReserveInDto,
} from '../../../common/dto/rewards/in';
import { EligibleSponsorsDto } from '../../../common/dto/rewards/in/eligible-sponsors.dto';

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

  @Get('eligible/sponsors')
  @RewardsControllerDoc.getSponsors()
  async getEligibleSponsors(
    @Query() query: EligibleSponsorsDto,
  ): Promise<RewardSponsorsDto> {
    return this.rewardsService.getSponsorsEligible(query);
  }

  @Get('all/sponsors/object/:requiredObject')
  @RewardsControllerDoc.getSponsors()
  async getAllSponsorsByObject(
    @Param('requiredObject')
    requiredObject: string,
  ): Promise<RewardSponsorsDto> {
    return this.rewardsService.getSponsorsAll(requiredObject);
  }

  @Get('eligible/sponsors/object/:requiredObject')
  @RewardsControllerDoc.getSponsors()
  async getEligibleSponsorsByObjext(
    @Param('requiredObject')
    requiredObject: string,
    @Query() query: EligibleSponsorsDto,
  ): Promise<RewardSponsorsDto> {
    return this.rewardsService.getSponsorsEligible({
      requiredObject,
      ...query,
    });
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

  @Get('availability')
  @RewardsControllerDoc.getReserve()
  async canReserve(
    @Query() canReserveInDto: RewardsCanReserveInDto,
  ): Promise<RewardsCanReserveOutDto> {
    return this.rewardsService.canReserve({
      ...canReserveInDto,
    });
  }
}
