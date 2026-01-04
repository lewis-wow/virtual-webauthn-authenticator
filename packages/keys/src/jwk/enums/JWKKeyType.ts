import type { ValueOfEnum } from '@repo/types';

import { SharedKeyType } from '../../shared/enums/SharedKeyType';

/**
 * JSON Web Key Types (kty).
 *
 * Defines the standard string values for the `kty` parameter in a JWK.
 *
 * * EC - Elliptic Curve (RFC 7518, Section 6.1).
 * * RSA - RSA (RFC 7518, Section 6.3).
 * * oct - Octet Sequence / Symmetric (RFC 7518, Section 6.4).
 * * OKP - Octet Key Pair (RFC 8037, Section 2).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7518#section-6.1
 * @see https://datatracker.ietf.org/doc/html/rfc8037#section-2
 */
export const JWKKeyType = {
  /**
   * Elliptic Curve.
   * used with curves like P-256, P-384, P-521.
   */
  [SharedKeyType.EC]: SharedKeyType.EC,

  /**
   * RSA.
   * Used with algorithms like RS256, PS256.
   */
  [SharedKeyType.RSA]: SharedKeyType.RSA,

  /**
   * Octet Sequence (Symmetric).
   * Used for symmetric keys (HMAC, AES).
   *
   * NOTE: Not used. Is only for symmetric encryption.
   */
  // [SharedKeyType.Oct]: SharedKeyType.Oct,

  /**
   * Octet Key Pair.
   * Used with curves like Ed25519 or X25519.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8037#section-2
   *
   * NOTE: Not implemented / supported.
   */
  // [SharedKeyType.OKP]: SharedKeyType.OKP,
} as const satisfies Record<SharedKeyType, unknown>;

export type JWKKeyType = ValueOfEnum<typeof JWKKeyType>;
