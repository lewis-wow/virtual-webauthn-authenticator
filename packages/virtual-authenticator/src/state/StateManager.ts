import { Jwt } from '@repo/crypto';

import {
  AuthenticationPrevStateSchema,
  type AuthenticationPrevState,
} from './AuthenticationPrevStateSchema';
import {
  RegistrationPrevStateSchema,
  type RegistrationPrevState,
} from './RegistrationPrevStateSchema';

export type StateManagerOptions = {
  jwt: Jwt;
};

export class StateManager {
  private readonly jwt: Jwt;

  constructor(opts: StateManagerOptions) {
    this.jwt = opts.jwt;
  }

  async createToken(
    payload: RegistrationPrevState | AuthenticationPrevState,
  ): Promise<string> {
    return await this.jwt.sign(payload);
  }

  async validateToken(
    token: string,
  ): Promise<RegistrationPrevState | AuthenticationPrevState> {
    const jwks = await this.jwt.jwks.getJSONWebKeySet();
    return await Jwt.validateToken(
      token,
      RegistrationPrevStateSchema.or(AuthenticationPrevStateSchema),
      {
        jwks,
      },
    );
  }
}
