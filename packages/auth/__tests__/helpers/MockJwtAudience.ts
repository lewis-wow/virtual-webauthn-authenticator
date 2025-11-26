import { MaybePromise } from '@repo/types';
import { createLocalJWKSet, type JSONWebKeySet, jwtVerify } from 'jose';

import { JwtAudienceConfig } from '../../src/JwtAudience';
import type { JwtPayload } from '../../src/validation/JwtPayloadSchema';

export type MockJwtAudienceConfig = JwtAudienceConfig;

export type MockJwtAudienceOptions = {
  jwksFactory: () => MaybePromise<JSONWebKeySet>;
  config: MockJwtAudienceConfig;
};

export class MockJwtAudience {
  private readonly jwksFactory: () => MaybePromise<JSONWebKeySet>;
  private readonly config: MockJwtAudienceConfig;

  constructor(opts: MockJwtAudienceOptions) {
    this.jwksFactory = opts.jwksFactory;
    this.config = opts.config;
  }

  async validateToken(token: string): Promise<JwtPayload> {
    const JWKS = createLocalJWKSet(await this.jwksFactory());

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: this.config.iss,
      audience: this.config.aud,
    });

    return payload as JwtPayload;
  }
}
