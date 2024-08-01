import { Module } from '@nestjs/common';
import {
  CampaignActivationProvider,
  CampaignDeactivationProvider,
  CampaignDetailsProvider,
  CampaignExpiredListenerProvider,
  CampaignProviderHelper,
  CampaignSuspendProvider,
  CreateCampaignProvider,
  DebtObligationsProvider,
  DeleteCampaignProvider,
  GuideCampaignsProvider,
  UpdateCampaignProvider,
} from './campaign.provider';
import { PersistenceModule } from '../../persistance/persistence.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  AssignReservationProvider,
  GuideRejectReservationProvider,
  RejectReservationProvider,
  ReservationDetailsProvider,
  ReservationHelperProvider,
} from './reservation/reservation.providers';
import {
  CreateReviewProvider,
  FraudDetectionProvider,
  MessageOnReviewProvider,
} from './review/review.providers';
import { WobjectModule } from '../wobject/wobject.module';
import {
  GuideReservationsProvider,
  ObjectRewardsProvider,
  RewardsAllProvider,
  RewardsHelperProvider,
  RewardsMapProvider,
  UserHistoryProvider,
  UserRewardsProvider,
} from './rewards/rewards.provider';
import { CampaignPaymentModule } from '../campaign-payment/campaign-payment.module';
import { SponsorsBotModule } from '../sponsors-bot/sponsors-bot.module';
import { BlacklistModule } from '../blacklist/blacklist.module';

@Module({
  imports: [
    PersistenceModule,
    NotificationsModule,
    WobjectModule,
    CampaignPaymentModule,
    SponsorsBotModule,
    BlacklistModule,
  ],
  providers: [
    CreateCampaignProvider,
    CampaignProviderHelper,
    UpdateCampaignProvider,
    DeleteCampaignProvider,
    CampaignActivationProvider,
    CampaignDeactivationProvider,
    AssignReservationProvider,
    GuideCampaignsProvider,
    RejectReservationProvider,
    GuideRejectReservationProvider,
    CreateReviewProvider,
    FraudDetectionProvider,
    DebtObligationsProvider,
    RewardsAllProvider,
    CampaignSuspendProvider,
    CampaignExpiredListenerProvider,
    RewardsMapProvider,
    ObjectRewardsProvider,
    ReservationDetailsProvider,
    ReservationHelperProvider,
    RewardsHelperProvider,
    GuideReservationsProvider,
    UserHistoryProvider,
    UserRewardsProvider,
    CampaignDetailsProvider,
    MessageOnReviewProvider,
  ],
  exports: [
    CreateCampaignProvider,
    UpdateCampaignProvider,
    DeleteCampaignProvider,
    CampaignProviderHelper,
    CampaignActivationProvider,
    CampaignDeactivationProvider,
    AssignReservationProvider,
    GuideCampaignsProvider,
    RejectReservationProvider,
    GuideRejectReservationProvider,
    CreateReviewProvider,
    FraudDetectionProvider,
    DebtObligationsProvider,
    RewardsAllProvider,
    CampaignSuspendProvider,
    CampaignExpiredListenerProvider,
    RewardsMapProvider,
    ObjectRewardsProvider,
    ReservationDetailsProvider,
    ReservationHelperProvider,
    GuideReservationsProvider,
    UserHistoryProvider,
    UserRewardsProvider,
    CampaignDetailsProvider,
    MessageOnReviewProvider,
  ],
})
export class CampaignModule {}
