import {
  exportJWK,
  generateKeyPair,
  importJWK,
  type CryptoKey,
  type JSONWebKeySet,
} from 'jose';

import { Encryption } from '../Encryption';
import type { IJwksRepository, Jwk } from './IJwksRepository';

export type JwksOptions = {
  encryptionKey: string;
  jwksRepository: IJwksRepository;
  alg?: string;
  crv?: string;
};

export class Jwks {
  static readonly DEFAULT_ALG = 'EdDSA';
  static readonly DEFAULT_CRV = 'Ed25519';

  readonly alg: string;
  readonly crv: string;
  private readonly encryptionKey: string;
  private readonly jwksRepository: IJwksRepository;

  constructor(opts: JwksOptions) {
    this.alg = opts.alg ?? Jwks.DEFAULT_ALG;
    this.crv = opts.crv ?? Jwks.DEFAULT_CRV;
    this.encryptionKey = opts.encryptionKey;
    this.jwksRepository = opts.jwksRepository;
  }

  private async _convertKeyToBytes(
    key: CryptoKey | Uint8Array,
  ): Promise<Uint8Array> {
    if (key instanceof Uint8Array) {
      return key;
    }

    if (!key.extractable) {
      throw new Error('The provided CryptoKey is marked as non-extractable.');
    }

    const exported = await crypto.subtle.exportKey('raw', key);
    return new Uint8Array(exported);
  }

  async generateKeyPair(): Promise<Jwk> {
    const { publicKey, privateKey } = await generateKeyPair(this.alg, {
      crv: this.crv,
      extractable: true,
    });

    const publicWebKey = await exportJWK(publicKey);
    const privateWebKey = await exportJWK(privateKey);

    const stringifiedPublicWebKey = JSON.stringify(publicWebKey);
    const stringifiedPrivateWebKey = JSON.stringify(privateWebKey);

    const encryptedStringifiedPrivateKey = Encryption.encrypt({
      key: this.encryptionKey,
      plainText: stringifiedPrivateWebKey,
    });

    const jwk = await this.jwksRepository.create({
      publicKey: stringifiedPublicWebKey,
      privateKey: encryptedStringifiedPrivateKey,
    });

    return jwk;
  }

  async getLatestPrivateKeyOrGenerate(): Promise<{
    id: string;
    alg: string;
    privateKey: Uint8Array;
  }> {
    let latestKey = await this.jwksRepository.findLatest();

    if (latestKey === null) {
      latestKey = await this.generateKeyPair();
    }

    const privateWebKey = JSON.parse(
      Encryption.decrypt({
        key: this.encryptionKey,
        encryptedText: latestKey.privateKey,
      }),
    );

    const privateKey = await importJWK(privateWebKey, this.alg);

    return {
      id: latestKey.id,
      alg: this.alg,
      privateKey: await this._convertKeyToBytes(privateKey),
    };
  }

  async getJSONWebKeySet(): Promise<JSONWebKeySet> {
    const keySets = await this.jwksRepository.findAll();

    if (keySets.length === 0) {
      const key = await this.generateKeyPair();
      keySets.push(key);
    }

    return {
      keys: keySets.map((key) => ({
        ...JSON.parse(key.publicKey),
        kid: key.id,
        alg: this.alg,
        crv: this.crv,
      })),
    };
  }
}
