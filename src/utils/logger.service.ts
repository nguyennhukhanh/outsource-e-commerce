import type { LoggerService } from '@nestjs/common';

import { getLogger } from './logger';

export class CustomLogger implements LoggerService {
  private logger = getLogger('THANHHOA');

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(message);
    if (trace) {
      this.logger.verbose(trace);
    }
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}
