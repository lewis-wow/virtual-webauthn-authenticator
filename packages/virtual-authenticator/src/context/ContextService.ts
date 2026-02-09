import { Jwt } from '@repo/crypto';

import {
  ContextTokenPayloadSchema,
  type ContextTokenPayload,
} from './validation/ContextSchema';

export type ContextServiceOptions = {
  jwt: Jwt;
};

export class ContextService {
  private readonly jwt: Jwt;

  constructor(opts: ContextServiceOptions) {
    this.jwt = opts.jwt;
  }

  async createToken(context: ContextTokenPayload): Promise<string> {
    return await this.jwt.sign(context);
  }

  async verifyToken(token: string): Promise<ContextTokenPayload> {
    return await Jwt.validateToken(token, ContextTokenPayloadSchema, {
      jwks: await this.jwt.jwks.getJSONWebKeySet(),
    });
  }
}
