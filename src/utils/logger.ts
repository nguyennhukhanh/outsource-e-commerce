import 'winston-daily-rotate-file';

import * as path from 'path';
import * as util from 'util';
import * as winston from 'winston';

const logIcons = {
  error: '❌',
  warn: '⚠️',
  info: '🟢',
  debug: '🐛',
  verbose: '🔵',
};

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    info.message = `[${info.name}] ${info.message}`;
    info.level = info.name;
  }
  return info;
});

const logFiles = {
  error: path.join(__dirname, '../../../logs/error.log'),
};

export function getLogger(name: string) {
  if (!winston.loggers.has(name)) {
    winston.loggers.add(name, {
      level: 'debug',
      format: winston.format.combine(
        enumerateErrorFormat(),
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf((info) => {
          const { timestamp, level, message, stack, ...extra } = info;
          const icon = logIcons[info[Symbol.for('level')]] || '';
          const extraDetails = Object.keys(extra).length
            ? util.inspect(extra)
            : '';
          const stackTrace = stack ? `\nStack Trace:\n${stack}` : '';
          return `${icon} [${name}][${level}] - [${timestamp}]: ${message}${extraDetails}${stackTrace}`;
        }),
      ),
      transports: [
        new winston.transports.Console({
          stderrLevels: ['error', 'verbose'],
        }),

        // Rotate logs daily and keep them for 7 days
        new winston.transports.DailyRotateFile({
          filename: 'logs/%DATE%-application.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '100mb',
          maxFiles: '7d',
        }),

        new winston.transports.File({
          filename: logFiles.error,
          level: 'error',
        }),
      ],
    });
  }

  const logger = winston.loggers.get(name);

  return {
    debug(msg: any) {
      return logger.debug(msg);
    },
    info(msg: any) {
      return logger.info(msg);
    },
    warn(msg: any) {
      return logger.warn(msg);
    },
    error(msg: any, error?: Error) {
      return logger.error(error ? `[${error.name}] ${error.message}` : msg);
    },
    verbose(msg: any, error?: Error) {
      return logger.verbose(error ? `[${error.name}] ${error.message}` : msg);
    },
  };
}
