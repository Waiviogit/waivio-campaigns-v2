import { Module } from '@nestjs/common';
import { NotificationsProvider } from './notifications.provider';

@Module({
  providers: [NotificationsProvider],
  exports: [NotificationsProvider],
})
export class NotificationsModule {}
