import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response, Request } from 'express';

@Injectable()
export class MockJwtMiddleware implements NestMiddleware {
  async use(_req: Request, _res: Response, next: NextFunction) {
    next();
  }
}
