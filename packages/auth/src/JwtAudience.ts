import { Jwt } from '@repo/crypto';

import {
  JwtPayloadSchema,
  type JwtPayload,
} from './zod-validation/JwtPayloadSchema';

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
    const payload = await Jwt.validateToken(token, JwtPayloadSchema, {
      jwks: `${this.authServerBaseURL}/.well-known/jwks.json`,
      verifyOptions: {
        issuer: this.config.iss,
        audience: this.config.aud,
      },
    });

    return payload;
  }
}
