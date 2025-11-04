import { Encryption } from '@repo/crypto';
import { Logger } from '@repo/logger';
import type { Jwks, PrismaClient } from '@repo/prisma';
import {
  exportJWK,
  generateKeyPair,
  importJWK,
  SignJWT,
  type JWK,
  type JWTPayload,
} from 'jose';

import { JWT_ALG, JWT_CRV } from './consts';

const LOG_PREFIX = 'JWT_ISSUER';

const log = new Logger({
  prefix: LOG_PREFIX,
});

export type JwtIssuerConfig = {
  aud: string;
  iss: string;
};

export type JwtIssuerOptions = {
  prisma: PrismaClient;
  encryptionKey: string;
  config: JwtIssuerConfig;
};

export class JwtIssuer {
  private readonly prisma: PrismaClient;
  private readonly encryptionKey: string;
  private readonly config: JwtIssuerConfig;

  constructor(opts: JwtIssuerOptions) {
    this.prisma = opts.prisma;
    this.encryptionKey = opts.encryptionKey;
    this.config = opts.config;
  }

  private async _generateExportedKeyPair(): Promise<{
    publicWebKey: JWK;
    privateWebKey: JWK;
  }> {
    const { publicKey, privateKey } = await generateKeyPair(JWT_ALG, {
      crv: JWT_CRV,
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

    log.info('New JWK was created.', {
      kid: newJwk.id,
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
        alg: JWT_ALG,
        crv: JWT_CRV,
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

    const privateKey = await importJWK(privateWebKey, JWT_ALG);

    const jwt = new SignJWT(payload)
      .setProtectedHeader({
        alg: JWT_ALG,
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
}
