import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configService } from './common/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('new-campaigns');
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Campaigns service')
    .setDescription('Campaigns service')
    .setVersion('1.0')
    .addTag('campaigns')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('new-campaigns/docs', app, document);
  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getRabbitConnectionString()],
      queue: configService.getCampaignsQueue(),
      queueOptions: {
        durable: true,
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(configService.getPort());
}
bootstrap();
