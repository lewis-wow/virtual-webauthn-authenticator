import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Jwt, JwtPayload } from '@repo/auth'

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload | null;
    }
  }
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: Jwt,
    private readonly logger: Logger,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers['authorization'];

    this.logger.debug(
      `Authorization header: ${authorizationHeader}`,
      JwtMiddleware.name,
    );

    const jwt = authorizationHeader?.replace('Bearer ', '');

    if (jwt) {
      try {
        const jwtPayload = await this.jwt.validateToken(
          jwt,
        );

        this.logger.debug(
          `JWT Payload: ${JSON.stringify(jwtPayload)}`,
          JwtMiddleware.name,
        );

        req.user = jwtPayload;
      } catch (error) {
        this.logger.error('Invalid JWT', (error as Error).message, JwtMiddleware.name);
        req.user = null;
      }
    } else {
      // No token provided
      req.user = null;
    }

    // Equivalent to return next()
    next();
  }
}
