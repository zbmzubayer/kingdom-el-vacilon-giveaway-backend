import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { type NestExpressApplication } from '@nestjs/platform-express';

import { ENV } from './config/env';

export const configureNestApp = (app: NestExpressApplication) => {
  app.enableShutdownHooks();

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  app.use(helmet());
  app.enableCors({ origin: [ENV.CLIENT_URL, ENV.GHL_URL] });

  app.use(compression());

  // Parser
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      validationError: {
        target: true,
        value: true,
      },
    }),
  );

  // app.useGlobalFilters(new AllExceptionsFilter(), new PrismaExceptionFilter());

  return app;
};
