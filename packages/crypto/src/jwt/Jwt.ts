import {
  createLocalJWKSet,
  createRemoteJWKSet,
  jwtVerify,
  SignJWT,
  type JSONWebKeySet,
  type JWTVerifyOptions,
} from 'jose';
import { match, P } from 'ts-pattern';

import type { Jwks } from './Jwks';

/**
 * JWT Registered Claims
 * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1 RFC7519#section-4.1}
 */
export type JwtPayload = {
  /**
   * JWT Issuer
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1 RFC7519#section-4.1.1}
   */
  iss?: string;

  /**
   * JWT Subject
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2 RFC7519#section-4.1.2}
   */
  sub?: string;

  /**
   * JWT Audience
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3 RFC7519#section-4.1.3}
   */
  aud?: string | string[];

  /**
   * JWT ID
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7 RFC7519#section-4.1.7}
   */
  jti?: string;

  /**
   * JWT Not Before
   * Per RFC, this is a "NumericDate" (seconds since epoch).
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5 RFC7519#section-4.1.5}
   */
  nbf?: number;

  /**
   * JWT Expiration Time
   * Per RFC, this is a "NumericDate" (seconds since epoch).
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4 RFC7519#section-4.1.4}
   */
  exp?: number;

  /**
   * JWT Issued At
   * Per RFC, this is a "NumericDate" (seconds since epoch).
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6 RFC7519#section-4.1.6}
   */
  iat?: number;
};

export type JwtOptions = {
  jwks: Jwks;
};

export class Jwt {
  static readonly DEFAULT_EXP = '15m';

  private readonly jwks: Jwks;

  constructor(opts: JwtOptions) {
    this.jwks = opts.jwks;
  }

  async sign<T extends JwtPayload>(payload: T, options?: JwtPayload) {
    const {
      privateKey,
      id: kid,
      alg,
    } = await this.jwks.getLatestPrivateKeyOrGenerate();

    const jwt = new SignJWT(payload)
      .setProtectedHeader({
        alg,
        kid,
        typ: 'JWT',
      })
      .setIssuedAt()
      .setExpirationTime(payload.exp ?? Jwt.DEFAULT_EXP);

    if (options?.iss) jwt.setIssuer(options.iss);
    if (options?.aud) jwt.setAudience(options.aud);
    if (options?.sub) jwt.setSubject(options.sub);
    if (options?.jti) jwt.setJti(options.jti);
    if (options?.nbf) jwt.setNotBefore(options.nbf);

    return await jwt.sign(privateKey);
  }

  static async validateToken(
    token: string,
    opts: {
      jwks: JSONWebKeySet | string | URL;
      verifyOptions?: JWTVerifyOptions;
    },
  ): Promise<JwtPayload> {
    const JWKS = match(opts.jwks)
      .when(
        (jwks) => typeof jwks === 'string',
        (jwks) => createRemoteJWKSet(new URL(jwks)),
      )
      .with(P.instanceOf(URL), (jwks) => createRemoteJWKSet(jwks))
      .otherwise((jwks) => createLocalJWKSet(jwks));

    const { payload } = await jwtVerify(token, JWKS, opts.verifyOptions);

    return payload;
  }
}
