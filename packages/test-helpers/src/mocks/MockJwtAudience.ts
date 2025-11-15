import type { JwtPayload } from '@repo/validation';
import { createLocalJWKSet, type JSONWebKeySet, jwtVerify } from 'jose';

export type MockJwtAudienceConfig = {
  iss: string;
  aud: 'test-audience';
};

export type MockJwtAudienceOptions = {};

export class MockJwtAudience {
  constructor(private readonly jwks: JSONWebKeySet) {}

  async validateToken(token: string): Promise<JwtPayload> {
    const JWKS = createLocalJWKSet(this.jwks);

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: 'http://localhost:3002',
      audience: 'http://localhost:3002',
    });

    return payload as JwtPayload;
  }
}
