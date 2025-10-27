import { createRemoteJWKSet, jwtVerify } from 'jose';

export type JwtOptions = {
  authServerBaseURL: string;
};

export class Jwt {
  private readonly authServerBaseURL: string;

  constructor(opts: JwtOptions) {
    this.authServerBaseURL = opts.authServerBaseURL;
  }

  async validateToken(token: string) {
    try {
      const JWKS = createRemoteJWKSet(
        new URL(`${this.authServerBaseURL}/api/auth/jwks`),
      );

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: this.authServerBaseURL,
        audience: this.authServerBaseURL,
      });

      return payload;
    } catch (error) {
      console.error('Token validation failed:', error);
      throw error;
    }
  }
}
