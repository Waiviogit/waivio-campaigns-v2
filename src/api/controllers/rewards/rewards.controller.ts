import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { HostPipe } from '../../pipes/host.pipe';
import { CustomHeaders } from '../../../common/decorators';
import { RewardsService } from './rewards.service';
import {
  GuideMessagesFiltersDto,
  GuideReservationFiltersDto,
  InBlacklistOutDto,
  ObjectRewardsOutDto,
  RewardsAllMainOutDto,
  RewardsByObjectOutDto,
  RewardsCanReserveOutDto,
  RewardsMapOutDto,
  RewardsTabDto,
  UserFollowingsOutDto,
  UserHistoryFiltersDto,
} from '../../../common/dto/rewards/out';
import { RewardsControllerDoc } from './rewards.controller.doc';
import { RewardSponsorsDto } from '../../../common/dto/rewards/out/reward-sponsors.dto';
import {
  GuideMessagesInDto,
  GuideReservationsInDto,
  ObjectRewardsInDto,
  RewardsAllInDto,
  RewardsCanReserveInDto,
  RewardsMapInDto,
  UserHistoryInDto,
} from '../../../common/dto/rewards/in';
import { EligibleSponsorsDto } from '../../../common/dto/rewards/in/eligible-sponsors.dto';
import { GuideFraudsInDto } from '../../../common/dto/rewards/in/guide-frauds-in.dto';
import {
  CONVERSATION_STATUS,
  RESERVATION_STATUS,
} from '../../../common/constants';
import { UserFollowingsInDto } from '../../../common/dto/rewards/in/user-followings-in.dto';

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

  @Post('all/map')
  @RewardsControllerDoc.getMap()
  async getAllMap(
    @CustomHeaders(new HostPipe())
    host: string,
    @Body() body: RewardsMapInDto,
  ): Promise<RewardsMapOutDto> {
    return this.rewardsService.getAllMap({
      host,
      ...body,
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
    @Param('requiredObject') requiredObject: string,
  ): Promise<RewardsByObjectOutDto> {
    return this.rewardsService.getEligibleByObject({
      requiredObject,
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

  @Post('eligible/map')
  @RewardsControllerDoc.getMap()
  async getEligibleMap(
    @CustomHeaders(new HostPipe())
    host: string,
    @Body() body: RewardsMapInDto,
  ): Promise<RewardsMapOutDto> {
    return this.rewardsService.getEligibleMap({
      host,
      ...body,
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

  @Get('reserved/:userName/filters')
  @RewardsControllerDoc.getSponsors()
  async getReservedFilters(
    @Param('userName')
    userName: string,
  ): Promise<RewardSponsorsDto> {
    return this.rewardsService.getReservedFilters({
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

  @Get('object/:authorPermlink')
  @RewardsControllerDoc.getRewardsByObject()
  async getRewardsByObject(
    @CustomHeaders(new HostPipe())
    host: string,
    @Param('authorPermlink')
    authorPermlink: string,
    @Query() query: ObjectRewardsInDto,
  ): Promise<ObjectRewardsOutDto> {
    return this.rewardsService.getRewardsByObject({
      host,
      authorPermlink,
      ...query,
    });
  }

  @Post('reservations/:guideName')
  @RewardsControllerDoc.getGuideReservations()
  async getGuideReservations(
    @CustomHeaders(new HostPipe())
    host: string,
    @Param('guideName')
    guideName: string,
    @Body() body: GuideReservationsInDto,
  ): Promise<RewardsByObjectOutDto> {
    return this.rewardsService.getGuideReservations({
      host,
      guideName,
      ...body,
    });
  }

  @Get('reservations/:guideName/filters')
  @RewardsControllerDoc.getGuideReservationsFilters()
  async getGuideReservationsFilters(
    @Param('guideName')
    guideName: string,
  ): Promise<GuideReservationFiltersDto> {
    return this.rewardsService.getGuideReservationsFilters({
      guideName,
    });
  }

  @Post('history/:userName')
  @RewardsControllerDoc.getUserHistory()
  async getUserHistory(
    @CustomHeaders(new HostPipe())
    host: string,
    @Param('userName')
    userName: string,
    @Body() body: UserHistoryInDto,
  ): Promise<RewardsByObjectOutDto> {
    return this.rewardsService.getUserHistory({
      host,
      userName,
      ...body,
    });
  }

  @Get('history/:userName/filters')
  @RewardsControllerDoc.getUserHistoryFilters()
  async getUserHistoryFilters(
    @Param('userName')
    userName: string,
  ): Promise<UserHistoryFiltersDto> {
    return this.rewardsService.getUserHistoryFilters({
      userName,
    });
  }

  @Post('frauds/:guideName')
  @RewardsControllerDoc.getGuideReservationsFrauds()
  async getGuideReservationsFrauds(
    @CustomHeaders(new HostPipe())
    host: string,
    @Param('guideName')
    guideName: string,
    @Body() body: GuideFraudsInDto,
  ): Promise<RewardsByObjectOutDto> {
    return this.rewardsService.getGuideReservationsFrauds({
      host,
      guideName,
      ...body,
    });
  }

  @Post('messages/guide/:guideName')
  @RewardsControllerDoc.getReservationMessages()
  async getReservationMessages(
    @CustomHeaders(new HostPipe())
    host: string,
    @Param('guideName')
    guideName: string,
    @Body() body: GuideMessagesInDto,
  ): Promise<RewardsByObjectOutDto> {
    return this.rewardsService.getReservationMessages({
      host,
      guideName,
      ...body,
    });
  }

  @Get('messages/filters')
  @RewardsControllerDoc.getMessagesFilter()
  async getMessagesFilter(): Promise<GuideMessagesFiltersDto> {
    return {
      statuses: Object.values(RESERVATION_STATUS),
      conversations: Object.values(CONVERSATION_STATUS),
    };
  }

  @Post('following/:userName')
  @RewardsControllerDoc.checkUserFollowings()
  async checkUserFollowings(
    @Param('userName')
    user: string,
    @Body() body: UserFollowingsInDto,
  ): Promise<UserFollowingsOutDto> {
    return this.rewardsService.checkUserFollowings({
      user,
      ...body,
    });
  }

  @Get('blacklist/:guideName/:userName')
  @RewardsControllerDoc.checkUserInBlacklist()
  async checkUserInBlacklist(
    @Param('userName')
    userName: string,
    @Param('guideName')
    guideName: string,
  ): Promise<InBlacklistOutDto> {
    return this.rewardsService.checkUserInBlacklist({ userName, guideName });
  }
}
