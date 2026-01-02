import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtAudience } from '@repo/auth';
import { BearerTokenMapper } from '@repo/auth/mappers';
import { Logger } from '@repo/logger';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtAudience: JwtAudience,
    private readonly logger: Logger,
  ) {}

  /**
   * Middleware to validate JWT tokens from Authorization header.
   * Sets req.user to the JWT payload if valid, null otherwise.
   */
  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.headers['authorization'];

    const jwt = BearerTokenMapper.tryFromBearerToken(authorizationHeader);

    if (jwt === null) {
      req.user = null;
      next();
      return;
    }

    try {
      const jwtPayload = await this.jwtAudience.validateToken(jwt);

      this.logger.debug('JWT', jwtPayload);

      req.user = jwtPayload;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.exception(error);
      }

      req.user = null;
    }

    next();
  }
}
