import { Jwt } from '@repo/crypto';

import {
  JwtPayloadSchema,
  type JwtPayload,
} from './zod-validation/JwtPayloadSchema';

export type JwtIssuerConfig = {
  aud: string;
  iss: string;
};

export type JwtIssuerOptions = {
  jwt: Jwt;
  config: JwtIssuerConfig;
};

export class JwtIssuer {
  private readonly config: JwtIssuerConfig;
  private readonly jwt: Jwt;

  constructor(opts: JwtIssuerOptions) {
    this.jwt = opts.jwt;
    this.config = opts.config;
  }

  async sign(payload: JwtPayload) {
    const encodedPayload = JwtPayloadSchema.encode(payload);

    const token = await this.jwt.sign(encodedPayload, {
      iss: this.config.iss,
      aud: this.config.aud,
    });

    return token;
  }
}
