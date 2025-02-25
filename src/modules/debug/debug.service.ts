import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import fs from 'fs';
import path from 'path';
import type { StellaConfig } from 'src/configs';
import type { MainConfig } from 'src/configs/main.config';

@Injectable()
export class DebugService {
  constructor(private readonly configService: ConfigService<StellaConfig>) {}
  getLogs(): string[] {
    const workingDirectory = this.configService.get<MainConfig>('main');

    if (workingDirectory) {
      const logPath = path.join(workingDirectory.workingDirectory, 'logs');
      const logs = fs.readdirSync(logPath);
      return logs;
    }

    return [];
  }

  readLog(res: Response, fileName: string): string {
    const workingDirectory = this.configService.get<MainConfig>('main');

    if (workingDirectory) {
      const logPath = path.join(
        workingDirectory.workingDirectory,
        'logs',
        fileName,
      );

      if (fs.existsSync(logPath)) {
        res.set('Content-Disposition', `attachment; filename="${fileName}"`);
        res.set('Content-Type', 'application/pdf');
        res.download(logPath, fileName);
        return 'Downloaded';
      } else {
        throw new BadRequestException('Log file not found');
      }
    }

    throw new BadRequestException('Working directory not found');
  }
}
