import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtAudience } from '@repo/auth';
import { Logger } from '@repo/logger';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtAudience: JwtAudience,
    private readonly logger: Logger,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const authorizationHeader = req.headers['authorization'];

    this.logger.debug(
      `Authorization header: ${authorizationHeader}`,
      JwtMiddleware.name,
    );

    const jwt = authorizationHeader?.replace('Bearer ', '');

    if (jwt) {
      try {
        const jwtPayload = await this.jwtAudience.validateToken(jwt);

        this.logger.debug(
          `JWT Payload: ${JSON.stringify(jwtPayload)}`,
          JwtMiddleware.name,
        );

        req.user = jwtPayload;
      } catch (error) {
        if (error instanceof Error) {
          this.logger.exception(error);
        }

        req.user = null;
      }
    } else {
      // No token provided
      req.user = null;
    }

    next();
  }
}
