import { Encryption } from '@repo/crypto';
import type { Jwks, PrismaClient } from '@repo/prisma';
import type { JwtPayload } from '@repo/validation';
import {
  createRemoteJWKSet,
  exportJWK,
  generateKeyPair,
  importJWK,
  jwtVerify,
  SignJWT,
  type JWK,
  type JWTPayload,
} from 'jose';

export type JwtConfig = {
  aud: string;
  iss: string;
};

export type JwtOptions = {
  prisma: PrismaClient;
  authServerBaseURL: string;
  encryptionKey: string;
  config: JwtConfig;
};

export class Jwt {
  private readonly prisma: PrismaClient;
  private readonly authServerBaseURL: string;
  private readonly encryptionKey: string;
  private readonly config: JwtConfig;

  static readonly ALG = 'EdDSA';
  static readonly CRV = 'Ed25519';

  constructor(opts: JwtOptions) {
    this.prisma = opts.prisma;
    this.authServerBaseURL = opts.authServerBaseURL;
    this.encryptionKey = opts.encryptionKey;
    this.config = opts.config;
  }

  private async _generateExportedKeyPair(): Promise<{
    publicWebKey: JWK;
    privateWebKey: JWK;
  }> {
    const { publicKey, privateKey } = await generateKeyPair(Jwt.ALG, {
      crv: Jwt.CRV,
      extractable: true,
    });

    const publicWebKey = await exportJWK(publicKey);
    const privateWebKey = await exportJWK(privateKey);

    return { publicWebKey, privateWebKey };
  }

  private async _createKey() {
    const { publicWebKey, privateWebKey } =
      await this._generateExportedKeyPair();

    const stringifiedPrivateWebKey = JSON.stringify(privateWebKey);

    const encryptedPrivateKey = Encryption.encrypt({
      key: this.encryptionKey,
      plainText: stringifiedPrivateWebKey,
    });

    const newJwk = await this.prisma.jwks.create({
      data: {
        publicKey: JSON.stringify(publicWebKey),
        privateKey: encryptedPrivateKey,
      },
    });

    return newJwk;
  }

  async getLatestKey(): Promise<Jwks | undefined> {
    const key = await this.prisma.jwks.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    return key[0];
  }

  async getKeys() {
    const keySets = await this.prisma.jwks.findMany();

    if (keySets.length === 0) {
      const key = await this._createKey();
      keySets.push(key);
    }

    return {
      keys: keySets.map((key) => ({
        ...JSON.parse(key.publicKey),
        kid: key.id,
        alg: Jwt.ALG,
        crv: Jwt.CRV,
      })),
    };
  }

  async sign(payload: JWTPayload) {
    let latestKey = await this.getLatestKey();

    if (!latestKey) {
      latestKey = await this._createKey();
    }

    const privateWebKey = JSON.parse(
      Encryption.decrypt({
        key: this.encryptionKey,
        encryptedText: latestKey.privateKey,
      }),
    );

    const privateKey = await importJWK(privateWebKey, Jwt.ALG);

    const jwt = new SignJWT(payload)
      .setProtectedHeader({
        alg: Jwt.ALG,
        kid: latestKey.id,
        typ: 'JWT',
      })
      .setIssuedAt()
      .setExpirationTime('15m')
      .setIssuer(this.config.iss)
      .setAudience(this.config.aud);

    if (payload.sub) jwt.setSubject(payload.sub);

    return await jwt.sign(privateKey);
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const JWKS = createRemoteJWKSet(
        new URL(`${this.authServerBaseURL}/.well-known/jwks.json`),
      );

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: this.config.iss,
        audience: this.config.aud,
      });

      return payload as JwtPayload;
    } catch (error) {
      console.error('Token validation failed:', error);
      throw error;
    }
  }
}
