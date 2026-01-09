import { assertSchema } from '@repo/assert';
import { Buffer } from 'buffer';
import type { webcrypto } from 'crypto';
import { importJWK } from 'jose';
import z from 'zod';

import type { IKey } from '../shared/IKey';
import { JWKKeyAlgorithm } from './enums/JWKKeyAlgorithm';
import { JWKKeyCurveName } from './enums/JWKKeyCurveName';
import { JWKKeyParam } from './enums/JWKKeyParam';
import { JWKKeyType } from './enums/JWKKeyType';
import { JWKKeyTypeParam } from './enums/JWKKeyTypeParam';
import { CannotParseJsonWebKey } from './exceptions/CannotParseJsonWebKey';

/**
 * Input options for creating a JsonWebKey.
 * Accepts string or Uint8Array for cryptographic material, which will be normalized to Base64URL.
 */
export type JsonWebKeyOptions = {
  /**
   * Key identifier (kid).
   */
  [JWKKeyParam.kid]?: string;

  /**
   * Key Type (kty).
   */
  [JWKKeyParam.kty]?: string;

  /**
   * Key Operations (key_ops).
   */
  [JWKKeyParam.key_ops]?: string[];

  /**
   * Algorithm (alg).
   */
  [JWKKeyParam.alg]?: string;

  /**
   * Elliptic Curve Name (crv).
   */
  [JWKKeyTypeParam.EC_crv]?: string;

  /**
   * X Coordinate (x).
   */
  [JWKKeyTypeParam.EC_x]?: Uint8Array | string;

  /**
   * Y Coordinate (y).
   */
  [JWKKeyTypeParam.EC_y]?: Uint8Array | string;

  /**
   * RSA Modulus (n).
   */
  [JWKKeyTypeParam.RSA_n]?: Uint8Array | string;

  /**
   * RSA Public Exponent (e).
   */
  [JWKKeyTypeParam.RSA_e]?: Uint8Array | string;
};

/**
 * Represents a JSON Web Key (JWK) as defined in RFC 7517.
 *
 * @see http://tools.ietf.org/html/draft-ietf-jose-json-web-key-18
 */
export class JsonWebKey implements IKey {
  // --- Common Parameters ---
  public kid?: string;
  public kty?: JWKKeyType;
  public keyOps?: string[];

  // --- EC / OKP Parameters ---
  public crv?: string;
  public x?: string;
  public y?: string;

  // --- RSA Parameters ---
  public n?: string;
  public e?: string;

  constructor(opts: JsonWebKeyOptions) {
    if (!JsonWebKey.canParse(opts)) {
      throw new CannotParseJsonWebKey();
    }

    // Common
    if (opts[JWKKeyParam.kid]) this.kid = opts[JWKKeyParam.kid];
    if (opts[JWKKeyParam.kty]) this.kty = opts[JWKKeyParam.kty] as JWKKeyType;
    if (opts[JWKKeyParam.key_ops]) this.keyOps = opts[JWKKeyParam.key_ops];

    // EC
    if (opts[JWKKeyTypeParam.EC_crv]) this.crv = opts[JWKKeyTypeParam.EC_crv];
    if (opts[JWKKeyTypeParam.EC_x])
      this.x = this._toBase64url(opts[JWKKeyTypeParam.EC_x]!);
    if (opts[JWKKeyTypeParam.EC_y])
      this.y = this._toBase64url(opts[JWKKeyTypeParam.EC_y]!);

    // RSA
    if (opts[JWKKeyTypeParam.RSA_n])
      this.n = this._toBase64url(opts[JWKKeyTypeParam.RSA_n]!);
    if (opts[JWKKeyTypeParam.RSA_e])
      this.e = this._toBase64url(opts[JWKKeyTypeParam.RSA_e]!);
  }

  public toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {};

    // Common
    if (this.kid) json[JWKKeyParam.kid] = this.kid;
    if (this.kty) json[JWKKeyParam.kty] = this.kty;
    if (this.keyOps) json[JWKKeyParam.key_ops] = this.keyOps;

    // EC
    if (this.crv) json[JWKKeyTypeParam.EC_crv] = this.crv;
    if (this.x) json[JWKKeyTypeParam.EC_x] = this.x;
    if (this.y) json[JWKKeyTypeParam.EC_y] = this.y;

    // RSA Public
    if (this.n) json[JWKKeyTypeParam.RSA_n] = this.n;
    if (this.e) json[JWKKeyTypeParam.RSA_e] = this.e;

    return json;
  }

  public static fromJSON(json: Record<string, unknown>): JsonWebKey {
    const jsonWebKeyOptions: JsonWebKeyOptions = {
      // Common
      [JWKKeyParam.kid]: json[JWKKeyParam.kid] as string,
      [JWKKeyParam.kty]: json[JWKKeyParam.kty] as string,
      [JWKKeyParam.key_ops]: json[JWKKeyParam.key_ops] as string[],
      [JWKKeyParam.alg]: json[JWKKeyParam.alg] as string,

      // EC
      [JWKKeyTypeParam.EC_crv]: json[JWKKeyTypeParam.EC_crv] as string,
      [JWKKeyTypeParam.EC_x]: json[JWKKeyTypeParam.EC_x] as string,
      [JWKKeyTypeParam.EC_y]: json[JWKKeyTypeParam.EC_y] as string,

      // RSA
      [JWKKeyTypeParam.RSA_n]: json[JWKKeyTypeParam.RSA_n] as string,
      [JWKKeyTypeParam.RSA_e]: json[JWKKeyTypeParam.RSA_e] as string,
    };

    return new JsonWebKey(jsonWebKeyOptions);
  }
  // --- Common Parameters ---

  public getKty(): string | undefined {
    return this.kty;
  }

  public getKid(): string | undefined {
    return this.kid;
  }

  public getAlg(): string | undefined {
    switch (this.kty) {
      case JWKKeyType.EC:
        switch (this.crv) {
          case JWKKeyCurveName['P-256']:
            return JWKKeyAlgorithm.ES256;
          case JWKKeyCurveName['P-384']:
            return JWKKeyAlgorithm.ES384;
          case JWKKeyCurveName['P-521']:
            return JWKKeyAlgorithm.ES512;
          default:
            return undefined;
        }

      case JWKKeyType.RSA:
        // RSA keys are versatile. They can be used for:
        // - RS256 (PKCS1-v1_5)
        // - PS256 (PSS)
        // - RSA-OAEP (Encryption)
        // Without an explicit 'alg', defaulting to PS256 (Recommended) is a reasonable choice for WebAuthn context,
        // but strictly speaking, it's ambiguous.
        return JWKKeyAlgorithm.PS256;

      case JWKKeyType.OKP:
        switch (this.crv) {
          case JWKKeyCurveName.Ed25519:
            return JWKKeyAlgorithm.EdDSA;
          default:
            return undefined;
        }

      default:
        return undefined;
    }
  }

  public getKeyOps(): string[] | undefined {
    return this.keyOps;
  }

  // --- OKP (Octet Key Pair) Specific Properties ---

  /** Returns OKP Curve (crv) */
  public getOkpCrv(): string | undefined {
    return this.crv;
  }

  /** Returns OKP Public Key (x) */
  public getOkpX(): string | undefined {
    return this.x;
  }

  // --- EC (Elliptic Curve) Specific Properties ---

  /** Returns EC Curve (crv) */
  public getEcCrv(): string | undefined {
    return this.crv;
  }

  /** Returns EC X Coordinate (x) */
  public getEcX(): string | undefined {
    return this.x;
  }

  /** Returns EC Y Coordinate (y) */
  public getEcY(): string | undefined {
    return this.y;
  }

  // --- RSA Specific Properties ---

  /** Returns RSA Modulus (n) */
  public getRsaN(): string | undefined {
    return this.n;
  }

  /** Returns RSA Public Exponent (e) */
  public getRsaE(): string | undefined {
    return this.e;
  }

  /**
   * Converts this JWK to a standard Web Crypto `CryptoKey`.
   * Compatible with Node.js (v15+), Browsers, Deno, and Cloudflare Workers.
   */
  public async toCryptoKey(): Promise<webcrypto.CryptoKey> {
    // Convert your class instance to a plain JSON object
    const jwk = this.toJSON();

    // Let the 'jose' library handle the import
    // It automatically detects alg, crv, kty and maps them to Web Crypto API
    // Returns a standard Web Crypto 'CryptoKey'
    const key = await importJWK(jwk, this.getAlg());

    return key as webcrypto.CryptoKey;
  }

  /**
   * Helper to normalize cryptographic material (buffers or strings) to Base64URL strings.
   */
  private _toBase64url(optValue: string | Uint8Array): string {
    if (typeof optValue === 'string') {
      return optValue;
    }
    return Buffer.from(optValue).toString('base64url');
  }

  /**
   * Validates if the provided options object loosely adheres to the JWK schema.
   */
  public static canParse(
    looseJsonWebKey: JsonWebKeyOptions,
  ): looseJsonWebKey is JsonWebKeyOptions {
    try {
      // Validate Key Type
      assertSchema(looseJsonWebKey.kty, z.enum(JWKKeyType).optional());

      // Validate Key Operations
      assertSchema(looseJsonWebKey.key_ops, z.array(z.string()).optional());

      // Validate Curve
      assertSchema(looseJsonWebKey.crv, z.enum(JWKKeyCurveName).optional());

      // Additional structural checks could be added here (e.g., ensuring 'x' and 'y' exist if kty='EC')

      return true;
    } catch {
      return false;
    }
  }
}
