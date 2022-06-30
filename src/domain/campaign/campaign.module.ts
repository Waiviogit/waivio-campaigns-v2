import { Module } from '@nestjs/common';
import {
  CampaignActivationProvider,
  CampaignDeactivationProvider,
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
} from './reservation/reservation.providers';
import {
  CreateReviewProvider,
  FraudDetectionProvider,
} from './review/review.providers';
import { WobjectModule } from '../wobject/wobject.module';
import { RewardsAllProvider } from './rewards/rewards.provider';
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
  ],
  exports: [
    CreateCampaignProvider,
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
  ],
})
export class CampaignModule {}
