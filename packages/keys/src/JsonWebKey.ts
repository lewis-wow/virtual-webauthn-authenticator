import { Buffer } from 'buffer';
import { assert, isArray, isEnum, isOptional } from 'typanion';

import { KeyAlgorithm } from './enums/KeyAlgorithm';
import { KeyCurveName } from './enums/KeyCurveName';
import { KeyOperation } from './enums/KeyOperation';
import { KeyType } from './enums/KeyType';
import { CannotParseJsonWebKey } from './exceptions/CannotParseJsonWebKey';

export type JsonWebKeyOptions = {
  /**
   * Key identifier.
   */
  kid?: string;
  /**
   * JsonWebKey Key Type (kty), as defined in
   * https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-40. Possible values include:
   * 'EC', 'EC-HSM', 'RSA', 'RSA-HSM'
   */
  kty?: string;
  /**
   * Json web key operations. For more
   * information on possible key operations, see KeyOperation.
   */
  keyOps?: string[];
  /**
   * RSA modulus.
   */
  n?: Uint8Array | string;
  /**
   * RSA public exponent.
   */
  e?: Uint8Array | string;
  /**
   * RSA private exponent, or the D component of an EC private key.
   */
  d?: Uint8Array | string;
  /**
   * RSA private key parameter.
   */
  dp?: Uint8Array | string;
  /**
   * RSA private key parameter.
   */
  dq?: Uint8Array | string;
  /**
   * RSA private key parameter.
   */
  qi?: Uint8Array | string;
  /**
   * RSA secret prime.
   */
  p?: Uint8Array | string;
  /**
   * RSA secret prime, with `p < q`.
   */
  q?: Uint8Array | string;
  /**
   * Symmetric key.
   */
  k?: Uint8Array | string;
  /**
   * HSM Token, used with 'Bring Your Own Key'.
   */
  t?: Uint8Array | string;
  /**
   * Elliptic curve name. For valid values, see KeyCurveName. Possible values include:
   * 'P-256', 'P-384', 'P-521', 'P-256K'
   */
  crv?: string;
  /**
   * X component of an EC public key.
   */
  x?: Uint8Array | string;
  /**
   * Y component of an EC public key.
   */
  y?: Uint8Array | string;
};
/**
 * @see http://tools.ietf.org/html/draft-ietf-jose-json-web-key-18
 */
export class JsonWebKey {
  constructor(opts: JsonWebKeyOptions) {
    if (!JsonWebKey.canParse(opts)) {
      throw new CannotParseJsonWebKey();
    }

    if (opts.kty) this.kty = opts.kty;
    if (opts.keyOps) this.keyOps = opts.keyOps;
    if (opts.crv) this.crv = opts.crv;

    if (opts.n) this.n = this._toBase64url(opts.n);
    if (opts.e) this.e = this._toBase64url(opts.e);
    if (opts.d) this.d = this._toBase64url(opts.d);
    if (opts.dp) this.dp = this._toBase64url(opts.dp);
    if (opts.dq) this.dq = this._toBase64url(opts.dq);
    if (opts.qi) this.qi = this._toBase64url(opts.qi);
    if (opts.q) this.q = this._toBase64url(opts.q);
    if (opts.k) this.k = this._toBase64url(opts.k);
    if (opts.t) this.t = this._toBase64url(opts.t);
    if (opts.x) this.x = this._toBase64url(opts.x);
    if (opts.y) this.y = this._toBase64url(opts.y);
  }

  private _toBase64url(optValue: string | Uint8Array): string | undefined {
    if (typeof optValue === 'string') {
      return optValue;
    }

    return Buffer.from(optValue).toString('base64url');
  }

  /**
   * Key identifier.
   */
  kid?: string;
  /**
   * JsonWebKey Key Type (kty), as defined in
   * https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-40. Possible values include:
   * 'EC', 'EC-HSM', 'RSA', 'RSA-HSM'
   */
  kty?: KeyType;
  /**
   * Json web key operations. For more
   * information on possible key operations, see KeyOperation.
   */
  keyOps?: KeyOperation[];
  /**
   * RSA modulus.
   */
  n?: string;
  /**
   * RSA public exponent.
   */
  e?: string;
  /**
   * RSA private exponent, or the D component of an EC private key.
   */
  d?: string;
  /**
   * RSA private key parameter.
   */
  dp?: string;
  /**
   * RSA private key parameter.
   */
  dq?: string;
  /**
   * RSA private key parameter.
   */
  qi?: string;
  /**
   * RSA secret prime.
   */
  p?: string;
  /**
   * RSA secret prime, with `p < q`.
   */
  q?: string;
  /**
   * Symmetric key.
   */
  k?: string;
  /**
   * HSM Token, used with 'Bring Your Own Key'.
   */
  t?: string;
  /**
   * Elliptic curve name. For valid values, see KeyCurveName. Possible values include:
   * 'P-256', 'P-384', 'P-521', 'P-256K'
   */
  crv?: KeyCurveName;
  /**
   * X component of an EC public key.
   */
  x?: string;
  /**
   * Y component of an EC public key.
   */
  y?: string;

  inferAlg(): KeyAlgorithm | undefined {
    // Infer algorithm based on key type ('kty').
    switch (this.kty) {
      // Elliptic Curve Keys w/ x- and y-coordinate pair
      case KeyType.EC:
        // `EC`: `ES256`, `ES384`, `ES512`, `ES256K`
        switch (this.crv) {
          // secp256r1
          case KeyCurveName.P256:
            return KeyAlgorithm.ES256;
          // secp384r1
          case KeyCurveName.P384:
            return KeyAlgorithm.ES384;
          // secp521r1
          case KeyCurveName.P521:
            return KeyAlgorithm.ES512;
          default:
            return undefined;
        }

      case KeyType.RSA:
        // PS512
        // PS384

        // RSASSA-PSS w/ SHA-256
        return KeyAlgorithm.PS256;

      default:
        return undefined;
    }
  }

  static canParse(
    looseJsonWebKey: JsonWebKeyOptions,
  ): looseJsonWebKey is JsonWebKeyOptions & {
    kty?: KeyType;
    keyOps?: KeyOperation[];
    crv?: KeyCurveName;
  } {
    try {
      assert(looseJsonWebKey.kty, isOptional(isEnum(KeyType)));
      assert(looseJsonWebKey.keyOps, isOptional(isArray(isEnum(KeyOperation))));
      assert(looseJsonWebKey.crv, isOptional(isEnum(KeyCurveName)));

      return true;
    } catch {
      return false;
    }
  }
}
