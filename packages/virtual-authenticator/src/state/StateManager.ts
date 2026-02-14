import { Jwt } from '@repo/crypto';

import {
  StateTokenPayloadSchema,
  type StateTokenPayload,
} from './StateTokenPayloadSchema';

export type StateManagerOptions = {
  jwt: Jwt;
};

export class StateManager {
  private readonly jwt: Jwt;

  constructor(opts: StateManagerOptions) {
    this.jwt = opts.jwt;
  }

  async createToken(opts: StateTokenPayload): Promise<string> {
    const { action, prevState } = opts;

    return await this.jwt.sign({ action, prevState });
  }

  async validateToken(token: string): Promise<StateTokenPayload> {
    const jwks = await this.jwt.jwks.getJSONWebKeySet();

    const tokenPayload = await Jwt.validateToken(
      token,
      StateTokenPayloadSchema,
      {
        jwks,
      },
    );

    return tokenPayload;
  }
}
