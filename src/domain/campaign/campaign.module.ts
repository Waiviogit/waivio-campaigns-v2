import { Module } from '@nestjs/common';
import {
  CampaignActivationProvider,
  CampaignDeactivationProvider,
  CampaignProviderHelper,
  CreateCampaignProvider,
  DeleteCampaignProvider,
  GuideCampaignsProvider,
  UpdateCampaignProvider,
} from './campaign.provider';
import { PersistenceModule } from '../../persistance/persistence.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  AssignReservationProvider,
  RejectReservationProvider,
} from './reservation/reservation.providers';

@Module({
  imports: [PersistenceModule, NotificationsModule],
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
  ],
})
export class CampaignModule {}
