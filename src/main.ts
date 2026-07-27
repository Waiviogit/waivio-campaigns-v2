import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configService } from './common/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HiveProcessor } from './domain/processor/hive-processor';
import { EngineProcessor } from './domain/processor/engine-processor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('campaigns-v2');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Campaigns service')
    .setDescription('Campaigns service')
    .setVersion('1.0')
    .addTag('campaigns')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('campaigns-v2/docs', app, document);

  const hiveProcessor = app.get(HiveProcessor);
  const engineProcessor = app.get(EngineProcessor);

  await app.listen(configService.getPort());

  const bootstrapLogger = new Logger('Bootstrap');
  hiveProcessor.start().catch((error) => {
    bootstrapLogger.error(
      `HiveProcessor exited: ${error?.message ?? error}`,
      error?.stack,
    );
  });
  engineProcessor.start().catch((error) => {
    bootstrapLogger.error(
      `EngineProcessor exited: ${error?.message ?? error}`,
      error?.stack,
    );
  });
}
bootstrap();
