import { assertSchema } from '@repo/assert';
import { Buffer } from 'buffer';
import z from 'zod';

import type { IKey } from '../IKey';
// Assuming this enum exists based on your imports
import { KeyOperation } from '../enums/KeyOperation';
import {
  KeyCurveNameSchema,
  KeyOperationSchema,
  KeyTypeSchema,
} from '../zod-validation';
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
   * EC Private Key (d) or RSA Private Exponent.
   */
  [JWKKeyTypeParam.EC_d]?: Uint8Array | string;

  /**
   * RSA Modulus (n).
   */
  [JWKKeyTypeParam.RSA_n]?: Uint8Array | string;

  /**
   * RSA Public Exponent (e).
   */
  [JWKKeyTypeParam.RSA_e]?: Uint8Array | string;

  /**
   * RSA First Prime Factor (p).
   */
  [JWKKeyTypeParam.RSA_p]?: Uint8Array | string;

  /**
   * RSA Second Prime Factor (q).
   */
  [JWKKeyTypeParam.RSA_q]?: Uint8Array | string;

  /**
   * RSA First Factor CRT Exponent (dp).
   */
  [JWKKeyTypeParam.RSA_dp]?: Uint8Array | string;

  /**
   * RSA Second Factor CRT Exponent (dq).
   */
  [JWKKeyTypeParam.RSA_dq]?: Uint8Array | string;

  /**
   * RSA First CRT Coefficient (qi).
   */
  [JWKKeyTypeParam.RSA_qi]?: Uint8Array | string;

  /**
   * Symmetric Key Value (k).
   */
  [JWKKeyTypeParam.Oct_k]?: Uint8Array | string;

  /**
   * HSM Token (t).
   * Note: This is a proprietary extension, not in standard JWK spec, but kept for compatibility.
   */
  t?: Uint8Array | string;
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
  public keyOps?: KeyOperation[];

  // --- EC / OKP Parameters ---
  public crv?: string;
  public x?: string;
  public y?: string;
  public d?: string;

  // --- RSA Parameters ---
  public n?: string;
  public e?: string;
  public p?: string;
  public q?: string;
  public dp?: string;
  public dq?: string;
  public qi?: string;

  // --- Symmetric Parameters ---
  public k?: string;

  // --- Extensions ---
  public t?: string;

  constructor(opts: JsonWebKeyOptions) {
    if (!JsonWebKey.canParse(opts)) {
      throw new CannotParseJsonWebKey();
    }

    // Common
    if (opts.kid) this.kid = opts.kid;
    if (opts.kty) this.kty = opts.kty as JWKKeyType;
    if (opts.key_ops) this.keyOps = opts.key_ops as KeyOperation[];

    // EC
    if (opts.crv) this.crv = opts.crv;
    if (opts.x) this.x = this._toBase64url(opts.x);
    if (opts.y) this.y = this._toBase64url(opts.y);
    if (opts.d) this.d = this._toBase64url(opts.d);

    // RSA
    if (opts.n) this.n = this._toBase64url(opts.n);
    if (opts.e) this.e = this._toBase64url(opts.e);
    if (opts.p) this.p = this._toBase64url(opts.p);
    if (opts.q) this.q = this._toBase64url(opts.q);
    if (opts.dp) this.dp = this._toBase64url(opts.dp);
    if (opts.dq) this.dq = this._toBase64url(opts.dq);
    if (opts.qi) this.qi = this._toBase64url(opts.qi);

    // Symmetric
    if (opts.k) this.k = this._toBase64url(opts.k);

    // Extension
    if (opts.t) this.t = this._toBase64url(opts.t);
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
          case JWKKeyCurveName.P256:
            return JWKKeyAlgorithm.ES256;
          case JWKKeyCurveName.P384:
            return JWKKeyAlgorithm.ES384;
          case JWKKeyCurveName.P521:
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

      default:
        return undefined;
    }
  }

  public getKeyOps(): string[] | undefined {
    return this.keyOps;
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

  /** Returns EC2 Private Key (d) */
  public getEcD(): string | undefined {
    return this.d;
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

  /** Returns RSA Private Exponent (d) */
  public getRsaD(): string | undefined {
    return this.d;
  }

  /** Returns RSA Secret Prime p */
  public getRsaP(): string | undefined {
    return this.p;
  }

  /** Returns RSA Secret Prime q */
  public getRsaQ(): string | undefined {
    return this.q;
  }

  /** Returns RSA dP (d mod (p - 1)) */
  public getRsaDp(): string | undefined {
    return this.dp;
  }

  /** Returns RSA dQ (d mod (q - 1)) */
  public getRsaDq(): string | undefined {
    return this.dq;
  }

  /** Returns RSA qInv (CRT coefficient) */
  public getRsaQInv(): string | undefined {
    return this.qi;
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
      assertSchema(looseJsonWebKey.kty, KeyTypeSchema.optional());

      // Validate Key Operations
      assertSchema(
        looseJsonWebKey.key_ops,
        z.array(KeyOperationSchema).optional(),
      );

      // Validate Curve
      assertSchema(looseJsonWebKey.crv, KeyCurveNameSchema.optional());

      // Additional structural checks could be added here (e.g., ensuring 'x' and 'y' exist if kty='EC')

      return true;
    } catch {
      return false;
    }
  }
}
