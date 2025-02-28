import type { INestApplication } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { watch } from 'fs';
import { resolve } from 'path';

const logger = new Logger('EnvWatcher');

export function watchEnvFile(app: INestApplication) {
  const envPath = resolve(process.cwd(), '.env');

  // Restart application function
  const restartApp = async () => {
    try {
      logger.log('Closing current application instance...');
      await app.close();

      logger.log('Starting new application instance...');
      const newProcess = spawn(process.execPath, process.argv.slice(1), {
        stdio: 'inherit',
        detached: false,
        env: { ...process.env, RESTART: 'true' },
      });

      newProcess.on('spawn', () => {
        logger.log('New instance started, exiting old instance...');
        process.exit(0);
      });
    } catch (error) {
      logger.error('Failed to restart application:', error);
    }
  };

  // Watch for .env changes
  watch(envPath, { persistent: true }, async (eventType, filename) => {
    if (filename && !process.env.RESTART) {
      logger.log('.env file changed, restarting application...');
      await restartApp();
    }
  });
}
