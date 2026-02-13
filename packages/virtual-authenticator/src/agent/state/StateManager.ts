import { Jwt } from '@repo/crypto';

import {
  StateTokenPayloadAgentSchema,
  type StateTokenPayloadAgent,
} from './StateTokenPayloadAgentSchema';

export type StateManagerOptions = {
  jwt: Jwt;
};

export class StateManager {
  private readonly jwt: Jwt;

  constructor(opts: StateManagerOptions) {
    this.jwt = opts.jwt;
  }

  async createToken(payload: StateTokenPayloadAgent): Promise<string> {
    return await this.jwt.sign(payload);
  }

  async validateToken(token: string): Promise<StateTokenPayloadAgent> {
    const jwks = await this.jwt.jwks.getJSONWebKeySet();
    return await Jwt.validateToken(token, StateTokenPayloadAgentSchema, {
      jwks,
    });
  }
}
