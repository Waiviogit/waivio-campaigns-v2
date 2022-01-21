import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configService } from './common/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('new-campaigns');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(configService.getPort());
}
bootstrap();
