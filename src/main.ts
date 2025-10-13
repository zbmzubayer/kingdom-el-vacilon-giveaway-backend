import { configureNestApp } from '@/app';
import { ENV } from '@/config/env';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = ENV.PORT;
  const logger = new Logger('Bootstrap');

  try {
    configureNestApp(app);
    await app.listen(port);
    logger.log(`Application started on port: ${port}`);
  } catch (error) {
    logger.error('Error starting server:', error, 'Bootstrap');
  }
}
bootstrap();
