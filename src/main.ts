import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configService } from './common/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BlockProcessor } from './domain/processor/block-processor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('new-campaigns');
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Campaigns service')
    .setDescription('Campaigns service')
    .setVersion('1.0')
    .addTag('campaigns')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('new-campaigns/docs', app, document);
  const blockProcessor = app.get(BlockProcessor);

  await app.listen(configService.getPort());
  await blockProcessor.start();
}
bootstrap();
