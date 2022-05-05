import { Module } from '@nestjs/common';
import {
  CampaignActivationProvider,
  CampaignDeactivationProvider,
  CampaignProviderHelper,
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

@Module({
  imports: [PersistenceModule, NotificationsModule, WobjectModule],
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
  ],
})
export class CampaignModule {}
