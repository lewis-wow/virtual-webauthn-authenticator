import { Injectable, NestMiddleware } from '@nestjs/common';
import { Logger } from '@repo/logger';
import { getRequestId } from '@repo/utils';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const requestId = getRequestId(req);

    this.logger.debug('Request', {
      id: requestId,
      path: req.path,
      method: req.method,
    });

    res.on('finish', () => {
      this.logger.debug('Response', {
        id: requestId,
        path: req.path,
        method: req.method,
      });
    });

    next();
  }
}
