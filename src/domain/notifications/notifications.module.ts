import { Module } from '@nestjs/common';
import { NotificationsProvider } from './notifications.provider';
import { PersistenceModule } from '../../persistance/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [NotificationsProvider],
  exports: [NotificationsProvider],
})
export class NotificationsModule {}
