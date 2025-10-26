import { Encryption } from '@repo/crypto';
import type { Prisma, PrismaClient, User } from '@repo/prisma';
import {
  createLocalJWKSet,
  importJWK,
  jwtVerify,
  SignJWT,
  exportJWK,
} from 'jose';
import * as crypto from 'node:crypto';
import z from 'zod';

export type JwtConfig = {
  issuer: string;
  audience: string;
};

export type JwtOptions = {
  prisma: PrismaClient;
  encryptionKey: string;
  currentKid: string;
  config: JwtConfig;
};

export type JwtPayload = {
  id: string;

  /**
   * JWT Issuer
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1 RFC7519#section-4.1.1}
   */
  iss: string;

  /**
   * JWT Subject
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2 RFC7519#section-4.1.2}
   */
  sub: string;

  /**
   * JWT Audience
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3 RFC7519#section-4.1.3}
   */
  aud: string | string[];

  /**
   * JWT Expiration Time
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4 RFC7519#section-4.1.4}
   */
  exp: number;

  /**
   * JWT Issued At
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6 RFC7519#section-4.1.6}
   */
  iat: number;

  /**
   * JWT ID
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7 RFC7519#section-4.1.7}
   */
  jti?: string;

  /**
   * JWT Not Before
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5 RFC7519#section-4.1.5}
   */
  nbf?: number;
};

export class Jwt {
  static readonly SIGNING_ALGORITHM = 'EdDSA';
  static readonly CURVE = 'ed25519';
  static readonly JWT_SCHEMA = z.jwt();

  private readonly prisma: PrismaClient;
  private readonly config: JwtConfig;
  private readonly encryptionKey: string;
  private readonly currentKid: string;

  constructor(opts: JwtOptions) {
    this.prisma = opts.prisma;
    this.config = opts.config;
    this.encryptionKey = opts.encryptionKey;
    this.currentKid = opts.currentKid;
  }

  static isJwt(payload: unknown): payload is string {
    return Jwt.JWT_SCHEMA.safeParse(payload).success;
  }

  public async getJwks() {
    const jwks = await this.prisma.jwks.findMany();

    return {
      keys: jwks.map((jwk) => ({
        kid: jwk.id,
        use: 'sig',
        alg: Jwt.SIGNING_ALGORITHM,
        ...(jwk.publicKey as Prisma.JsonObject),
      })),
    };
  }

  private async _upsertJwk() {
    const jwk = await this.prisma.jwks.findUnique({
      where: {
        id: this.currentKid,
      },
    });

    if (jwk) {
      return jwk;
    }

    const { publicKey, privateKey } = crypto.generateKeyPairSync(Jwt.CURVE);

    const publicJwk = await exportJWK(publicKey);
    const privateJwk = await exportJWK(privateKey);

    const encryptedPrivateKey = Encryption.encrypt({
      key: this.encryptionKey,
      plainText: JSON.stringify(privateJwk),
    });

    const newJwk = await this.prisma.jwks.create({
      data: {
        id: this.currentKid,
        publicKey: JSON.stringify(publicJwk),
        privateKey: encryptedPrivateKey,
      },
    });

    return newJwk;
  }

  async sign(payload: Pick<User, 'id'>): Promise<string> {
    const jwk = await this._upsertJwk();

    const decryptedPrivateKey = Encryption.decrypt({
      key: this.encryptionKey,
      encryptedText: jwk.privateKey,
    });

    const privateKey = await importJWK(
      JSON.parse(decryptedPrivateKey),
      Jwt.SIGNING_ALGORITHM,
    );

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({
        alg: Jwt.SIGNING_ALGORITHM,
        kid: this.currentKid,
        typ: 'JWT',
      })
      .setIssuedAt()
      .setSubject(payload.id)
      .setIssuer(this.config.issuer)
      .setAudience(this.config.audience)
      .setExpirationTime('10m')
      .sign(privateKey);

    return jwt;
  }

  async verify(jwt: string): Promise<JwtPayload | null> {
    try {
      const jwks = await this.prisma.jwks.findMany();

      const JWKS = createLocalJWKSet({
        keys: jwks.map((jwk) => {
          const publicKeyJwk = jwk.publicKey as Prisma.JsonObject;

          publicKeyJwk.kid = jwk.id;

          return publicKeyJwk;
        }),
      });

      const { payload } = await jwtVerify<JwtPayload>(jwt, JWKS, {
        issuer: this.config.issuer,
        audience: this.config.audience,
      });

      return payload;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
