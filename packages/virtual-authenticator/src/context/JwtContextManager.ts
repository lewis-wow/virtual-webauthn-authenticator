import { Jwt } from '@repo/crypto';

import type {
  AuthenticatorAgentCreateCredentialArgs,
  IAuthenticatorAgent,
} from '../agent/IAuthenticatorAgent';
import type { ContextArgs } from './validation/ContextArgsSchema';
import {
  ContextTokenPayloadSchema,
  type ContextTokenPayload,
} from './validation/ContextSchema';

export type JwtContextManagerCreateCredentialsArgs =
  AuthenticatorAgentCreateCredentialArgs & {
    context: ContextArgs;
  };

export type JwtContextManagerOptions = {
  authenticatorAgent: IAuthenticatorAgent;
  jwt: Jwt;
};

export class JwtContextManager {
  private readonly authenticatorAgent: IAuthenticatorAgent;
  private readonly jwt: Jwt;

  constructor(opts: JwtContextManagerOptions) {
    this.authenticatorAgent = opts.authenticatorAgent;
    this.jwt = opts.jwt;
  }

  async createCredential(opts: AuthenticatorAgentCreateCredentialArgs) {
    const { origin, options, sameOriginWithAncestors, meta, context } = opts;

    let contextTokenPayload: ContextTokenPayload | undefined = undefined;
    if (context !== undefined) {
      contextTokenPayload = await Jwt.validateToken(
        context.token,
        ContextTokenPayloadSchema,
        {
          jwks: await this.jwt.jwks.getJSONWebKeySet(),
        },
      );
    }

    await this.authenticatorAgent.createCredential(opts);
  }
}
