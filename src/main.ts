import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { watchEnvFile } from './utils/env-watcher.util';
import {
  rateLimit,
  setupSwagger,
  validateEnvironmentVariables,
} from './utils/init';
import { CustomLogger } from './utils/logger.service';

// Set the timezone to UTC
process.env.TZ = 'Etc/Universal';

const logger = new Logger('E-Commerce');

let app: NestExpressApplication;

async function shutdown() {
  if (app) {
    await app.close();
    logger.log('Application gracefully closed');
  }
  process.exit(0);
}

async function bootstrap() {
  validateEnvironmentVariables();

  app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger: new CustomLogger(),
  });

  const configService = app.get(ConfigService);

  app.set('trust proxy', true);
  app.setGlobalPrefix(configService.get('main.apiPrefix'));

  // Move Swagger setup here, after setGlobalPrefix
  if (!configService.get('main.isProduction')) {
    setupSwagger(app);
  }

  // Apply CORS configuration regardless of production status
  const corsOptions = {
    origin: configService.get('main.whitelist')
      ? configService.get('main.whitelist').split(',')
      : '*',
    credentials: true,
    maxAge: 86400,
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    exposedHeaders: ['Content-Disposition'],
    optionsSuccessStatus: 200,
    preflightContinue: false, // Changed from true to false to properly handle preflight
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  };

  app.use(cors(corsOptions));
  logger.log(`CORS enabled with origin: ${corsOptions.origin}`);

  if (configService.get('main.isProduction')) {
    logger.log('Rate limit is enabled');
    app.use(rateLimit);
    app.use(helmet());

    app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Content-Security-Policy', "default-src 'self'");
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });
  }

  app.use(compression());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = configService.get('main.port') ?? 1410;
  await app.listen(port);
  logger.log(`App is running on port ${port}!`);

  // Watch for .env file changes
  watchEnvFile(app);
}

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

bootstrap();
