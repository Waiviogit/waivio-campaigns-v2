import { Global, Module } from '@nestjs/common';

import { HiveClientProvider } from './hive.provider';

@Global()
@Module({
  providers: [HiveClientProvider],
  exports: [HiveClientProvider],
})
export class HiveClientModule {}
