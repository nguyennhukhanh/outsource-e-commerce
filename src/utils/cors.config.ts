import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('CORS-Debug');

export function corsDebugMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.debug(`Incoming request from origin: ${req.headers.origin}`);
  logger.debug(`Request method: ${req.method}`);
  logger.debug(`Request path: ${req.path}`);
  logger.debug(`Request headers: ${JSON.stringify(req.headers)}`);

  res.on('finish', () => {
    logger.debug(`Response status: ${res.statusCode}`);
    logger.debug(`Response headers: ${JSON.stringify(res.getHeaders())}`);
  });

  next();
}
