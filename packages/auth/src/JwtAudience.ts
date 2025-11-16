import { Logger } from '@repo/logger';
import { JwtPayloadSchema, type JwtPayload } from '@repo/validation';
import { createRemoteJWKSet, jwtVerify } from 'jose';

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

      return JwtPayloadSchema.parse(payload);
    } catch (error) {
      log.error('Token validation failed.', { token, error });
      throw error;
    }
  }
}
