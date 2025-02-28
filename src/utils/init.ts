import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { validateAllConfigs } from 'src/configs';

import { getLogger } from './logger';

const logger = getLogger('DDOS REPORT');

export const setupSwagger = (app: INestApplication): void => {
  const options = new DocumentBuilder()
    .setTitle('E-commerce')
    .setDescription('E-commerce APIs Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};

const rateLimiter = new RateLimiterMemory({
  points: 150, // 150 requests per 10 minutes
  duration: 10 * 60,
});

export const rateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.table([
      {
        'X-Forwarded-For': req.headers['x-forwarded-for'],
        'X-Real-IP': req.headers['x-real-ip'],
        IP: req.ip,
      },
    ]);

    await rateLimiter.consume(req.ip, 1);
    next();
  } catch {
    logger.warn(`Too many requests from ${req.ip}`);

    res.status(HttpStatus.TOO_MANY_REQUESTS).send({
      meta: {
        code: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests, please try again later.',
      },
      data: {},
    });
  }
};

export function validateEnvironmentVariables() {
  const logger = getLogger('Validate');
  validateAllConfigs().catch((error) => {
    logger.error('Environment validation failed', error);
    process.exit(1);
  });
}
