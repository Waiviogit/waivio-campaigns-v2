import { Module } from '@nestjs/common';
import { NotificationsProvider } from './notifications.provider';
import { PersistenceModule } from '../../persistance/persistence.module';
import { WobjectModule } from '../wobject/wobject.module';

@Module({
  imports: [PersistenceModule, WobjectModule],
  providers: [NotificationsProvider],
  exports: [NotificationsProvider],
})
export class NotificationsModule {}
