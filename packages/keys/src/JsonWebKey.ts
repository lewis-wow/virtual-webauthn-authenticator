import { KeyAlgorithm, KeyCurveName, KeyOperation, KeyType } from '@repo/enums';
import { assert, isEnum, isOptional } from 'typanion';

export type JsonWebKeyOptions = {
  alg?: string;
  /**
   * Key identifier.
   */
  kid?: string;
  /**
   * JsonWebKey Key Type (kty), as defined in
   * https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-40.
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
  n?: Uint8Array;
  /**
   * RSA public exponent.
   */
  e?: Uint8Array;
  /**
   * RSA private exponent, or the D component of an EC private key.
   */
  d?: Uint8Array;
  /**
   * RSA private key parameter.
   */
  dp?: Uint8Array;
  /**
   * RSA private key parameter.
   */
  dq?: Uint8Array;
  /**
   * RSA private key parameter.
   */
  qi?: Uint8Array;
  /**
   * RSA secret prime.
   */
  p?: Uint8Array;
  /**
   * RSA secret prime, with `p < q`.
   */
  q?: Uint8Array;
  /**
   * Symmetric key.
   */
  k?: Uint8Array;
  /**
   * HSM Token, used with 'Bring Your Own Key'.
   */
  t?: Uint8Array;
  /**
   * Elliptic curve name. For valid values, see KeyCurveName. Possible values include:
   * 'P-256', 'P-384', 'P-521', 'P-256K'
   */
  crv?: string;
  /**
   * X component of an EC public key.
   */
  x?: Uint8Array;
  /**
   * Y component of an EC public key.
   */
  y?: Uint8Array;
};

export class JsonWebKey {
  constructor(opts: JsonWebKeyOptions) {
    const alg = JsonWebKey.inferAlg(opts);

    assert(alg, isEnum(KeyAlgorithm));
    assert(opts.kty, isOptional(isEnum(KeyType)));
    assert(opts.keyOps, isOptional(isEnum(KeyOperation)));
    assert(opts.crv, isOptional(isEnum(KeyCurveName)));

    Object.assign(this, { ...opts, alg });
  }

  alg!: KeyAlgorithm;
  /**
   * Key identifier.
   */
  kid?: string;
  /**
   * JsonWebKey Key Type (kty), as defined in
   * https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-40.
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
  n?: Uint8Array;
  /**
   * RSA public exponent.
   */
  e?: Uint8Array;
  /**
   * RSA private exponent, or the D component of an EC private key.
   */
  d?: Uint8Array;
  /**
   * RSA private key parameter.
   */
  dp?: Uint8Array;
  /**
   * RSA private key parameter.
   */
  dq?: Uint8Array;
  /**
   * RSA private key parameter.
   */
  qi?: Uint8Array;
  /**
   * RSA secret prime.
   */
  p?: Uint8Array;
  /**
   * RSA secret prime, with `p < q`.
   */
  q?: Uint8Array;
  /**
   * Symmetric key.
   */
  k?: Uint8Array;
  /**
   * HSM Token, used with 'Bring Your Own Key'.
   */
  t?: Uint8Array;
  /**
   * Elliptic curve name. For valid values, see KeyCurveName. Possible values include:
   * 'P-256', 'P-384', 'P-521', 'P-256K'
   */
  crv?: KeyCurveName;
  /**
   * X component of an EC public key.
   */
  x?: Uint8Array;
  /**
   * Y component of an EC public key.
   */
  y?: Uint8Array;

  private static inferAlg(
    jwk: Partial<Pick<JsonWebKeyOptions, 'kty' | 'crv' | 'alg'>>,
  ) {
    assert(jwk.alg, isOptional(isEnum(KeyAlgorithm)));

    // If 'alg' is explicitly provided, it has the highest priority.
    if (jwk.alg) {
      return jwk.alg;
    }

    // Infer algorithm based on key type ('kty').
    switch (jwk.kty) {
      // Elliptic Curve Keys w/ x- and y-coordinate pair
      case KeyType.EC:
      case KeyType.EC_HSM:
        // `EC`: `ES256`, `ES384`, `ES512`, `ES256K`
        switch (jwk.crv) {
          // secp256r1
          case 'P-256':
            return 'ES256';
          // secp384r1
          case 'P-384':
            return 'ES384';
          // secp521r1
          case 'P-521':
            return 'ES512';
          default:
            throw new Error(
              `Cannot infer asymetric signing algorithm for kty: ${jwk.kty}, crv: ${jwk.crv}.`,
            );
        }

      case KeyType.RSA:
      case KeyType.RSA_HSM:
        // PS512
        // PS384

        // RSASSA-PSS w/ SHA-256
        return 'PS256';

      default:
        throw new Error(
          `Cannot infer asymetric signing algorithm for kty: ${jwk.kty}.`,
        );
    }
  }
}
