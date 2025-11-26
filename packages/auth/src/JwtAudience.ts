import { Logger } from '@repo/logger';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import {
  JwtPayloadSchema,
  type JwtPayload,
} from './zod-validation/JwtPayloadSchema';

const LOG_PREFIX = 'JWT_AUDIENCE';

const log = new Logger({
  prefix: LOG_PREFIX,
});

export type JwtAudienceConfig = {
  aud: string;
  iss: string;
};

export type JwtAudienceOptions = {
  authServerBaseURL: string;
  config: JwtAudienceConfig;
};

export class JwtAudience {
  private readonly authServerBaseURL: string;
  private readonly config: JwtAudienceConfig;

  constructor(opts: JwtAudienceOptions) {
    this.authServerBaseURL = opts.authServerBaseURL;
    this.config = opts.config;
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const JWKS = createRemoteJWKSet(
        new URL(`${this.authServerBaseURL}/.well-known/jwks.json`),
      );

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: this.config.iss,
        audience: this.config.aud,
      });

      const paredPayload = JwtPayloadSchema.parse(payload);
      return paredPayload;
    } catch (error) {
      log.error('Token validation failed.', { token, error });
      throw error;
    }
  }
}
