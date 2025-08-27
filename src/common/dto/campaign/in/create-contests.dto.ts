import { CampaignDto } from '../campaign.dto';
import { PickType } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class CreateContestsDto extends PickType(CampaignDto, [
  'guideName',
  'name',
  'description',
  'imageToDisplay',
  'type',
  'note',
  'compensationAccount',
  'budget',
  'reward',
  'countReservationDays',
  'agreementObjects',
  'usersLegalNotice',
  'commissionAgreement',
  'requirements',
  'userRequirements',
  'requiredObject',
  'blacklistUsers',
  'whitelistUsers',
  'matchBots',
  'frequencyAssign',
  'reservationTimetable',
  'app',
  'expiredAt',
  'stoppedAt',
  'currency',
  'payoutToken',
  'qualifiedPayoutToken',
  'reach',
  'timezone',

  'contestJudges',
  'contestRewards',
  'giveawayPermlink',
  'giveawayPostTitle',
  'giveawayRequirements',
]) {
  @IsArray()
  @IsString({ each: true })
  @Matches(/\S+/, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(1)
  objects: string[];
}
