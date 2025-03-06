import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { getLogger } from 'src/utils/logger';

const logger = getLogger('HealthController');

@Controller()
export class HealthController {
  @Get('user-agent')
  async userAgent(
    @Req() req: Request,
  ): Promise<{ isBot: boolean; userAgent: string }> {
    const userAgent = req.headers['user-agent'];
    const bots = [
      'googlebot',
      'bingbot',
      'yahoo! slurp',
      'duckduckbot',
      'baiduspider',
      'yandexbot',
    ];

    const isBot = bots.some((bot) => userAgent.toLowerCase().includes(bot));

    const response = {
      isBot,
      userAgent,
    };

    logger.debug(JSON.stringify(response));

    return response;
  }
}
