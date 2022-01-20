import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  //#TODO normal connection string
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/waivio')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
