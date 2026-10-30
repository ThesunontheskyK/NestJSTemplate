import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';


const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      // ปรับสี Status Code ตามช่วงเลข HTTP Status
      let statusColor = colors.green; // 2xx = เขียว
      if (statusCode >= 500) {
        statusColor = colors.red; // 5xx = แดง
      } else if (statusCode >= 400) {
        statusColor = colors.yellow; // 4xx = เหลือง
      } else if (statusCode >= 300) {
        statusColor = colors.cyan; // 3xx = ฟ้า
      }

      this.logger.log(
        `[${method}] ${originalUrl} -> Status: ${statusColor}${statusCode}${colors.reset} (${duration}ms)`,
      );
    });

    next();
  }
}