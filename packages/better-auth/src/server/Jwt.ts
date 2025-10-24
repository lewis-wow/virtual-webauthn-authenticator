import { createRemoteJWKSet, jwtVerify } from 'jose';

export type JwtOptions = {
  baseUrl: string;
};

export class Jwt {
  private readonly baseUrl: string;

  constructor(opts: JwtOptions) {
    this.baseUrl = opts.baseUrl;
  }

  async verify(token: string) {
    const JWKS = createRemoteJWKSet(new URL(`${this.baseUrl}/api/auth/jwks`));

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: this.baseUrl, // Should match your JWT issuer, which is the BASE_URL
      audience: this.baseUrl, // Should match your JWT audience, which is the BASE_URL by default
    });

    return payload;
  }
}
