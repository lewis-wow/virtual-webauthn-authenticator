import type { ValueOfEnum } from '@repo/types';

/**
 * JSON Web Key (JWK) Common Parameters.
 *
 * Defines the string keys used for the standard top-level parameters in a JWK object.
 * Algorithm-specific parameters (like 'x', 'y', 'n', 'e') are defined in `JWKKeyTypeParam`.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7517#section-4
 */
export const JWKKeyParam = {
  /**
   * Key Type.
   * Identifies the cryptographic algorithm family used with the key (e.g., "RSA", "EC").
   */
  kty: 'kty',

  /**
   * Public Key Use.
   * Identifies the intended use of the public key (e.g., "sig" for signature, "enc" for encryption).
   */
  use: 'use',

  /**
   * Key Operations.
   * Identifies the operation(s) for which the key is intended to be used (e.g., "sign", "verify").
   */
  key_ops: 'key_ops',

  /**
   * Algorithm.
   * Identifies the algorithm intended for use with the key.
   */
  alg: 'alg',

  /**
   * Key ID.
   * Used to match a specific key.
   */
  kid: 'kid',

  /**
   * X.509 URL.
   * A URI that refers to a resource for an X.509 public key certificate or certificate chain.
   */
  x5u: 'x5u',

  /**
   * X.509 Certificate Chain.
   * Contains a chain of one or more PKIX certificates.
   */
  x5c: 'x5c',

  /**
   * X.509 Certificate SHA-1 Thumbprint.
   */
  x5t: 'x5t',

  /**
   * X.509 Certificate SHA-256 Thumbprint.
   */
  'x5t#S256': 'x5t#S256',

  /**
   * Extractable.
   * (WebCrypto API extension).
   */
  ext: 'ext',
} as const;

export type JWKKeyParam = ValueOfEnum<typeof JWKKeyParam>;
