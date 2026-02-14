import { Jwt } from '@repo/crypto';

import {
  AuthenticationPrevStateWithActionSchema,
  type AuthenticationPrevStateWithAction,
} from './AuthenticationPrevStateSchema';
import {
  RegistrationPrevStateWithActionSchema,
  type RegistrationPrevStateWithAction,
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
    payload:
      | RegistrationPrevStateWithAction
      | AuthenticationPrevStateWithAction,
  ): Promise<string> {
    return await this.jwt.sign(payload);
  }

  async validateToken(
    token: string,
  ): Promise<
    RegistrationPrevStateWithAction | AuthenticationPrevStateWithAction
  > {
    const jwks = await this.jwt.jwks.getJSONWebKeySet();
    return await Jwt.validateToken(
      token,
      RegistrationPrevStateWithActionSchema.or(
        AuthenticationPrevStateWithActionSchema,
      ),
      {
        jwks,
      },
    );
  }
}
