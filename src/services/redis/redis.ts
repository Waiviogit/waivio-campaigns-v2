import { createClient } from 'redis';
import { OnModuleInit } from '@nestjs/common';

export class Redis implements OnModuleInit {
  client = createClient({
    url: 'redis://localhost:6379/2',
  });

  async onModuleInit() {
    await this.client.connect();
    console.log('connected--------------REDIS');
  }
}
