import { Jwt } from '@repo/crypto';

import { StateTokenPayloadSchema } from './StateTokenPayloadSchema';
import type { StateTokenPayload } from './StateTokenPayloadSchema';

export type StateManagerOptions = {
  jwt: Jwt;
};

export class StateManager {
  private readonly jwt: Jwt;

  constructor(opts: StateManagerOptions) {
    this.jwt = opts.jwt;
  }

  async createToken(payload: StateTokenPayload): Promise<string> {
    return await this.jwt.sign(payload);
  }

  async validateToken(token: string): Promise<StateTokenPayload> {
    const jwks = await this.jwt.jwks.getJSONWebKeySet();
    return await Jwt.validateToken(token, StateTokenPayloadSchema, { jwks });
  }
}
