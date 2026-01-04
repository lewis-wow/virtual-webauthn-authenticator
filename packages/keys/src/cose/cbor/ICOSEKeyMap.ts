import type { COSEKeyParam } from '../enums/COSEKeyParam';
import type { COSEKeyTypeParam } from '../enums/COSEKeyTypeParam';

/**
 * COSE Key structure as defined in RFC 8152.
 * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7
 */
export interface ICOSEKeyMap extends Map<number, unknown> {
  // Common COSE Key Parameters

  /**
   * Key Type (kty) - Identifies the family of keys for this structure.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
   * Common values: COSEKeyType.EC (2), COSEKeyType.RSA (3)
   */
  get(key: typeof COSEKeyParam.kty): number | undefined;

  /**
   * Key ID (kid) - Identification value matched to the kid in the message.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
   */
  get(key: typeof COSEKeyParam.kid): Uint8Array | undefined;

  /**
   * Algorithm (alg) - The algorithm that is used with the key.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
   * Common values: COSEKeyAlgorithm.ES256 (-7), COSEKeyAlgorithm.RS256 (-257)
   */
  get(key: typeof COSEKeyParam.alg): number | undefined;

  /**
   * Key Operations (key_ops) - Restricts the set of operations that a key is to be used for.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
   */
  get(key: typeof COSEKeyParam.key_ops): number[] | undefined;

  /**
   * Base IV (base_iv) - Base initialization vector to be XORed with partial IVs.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
   */
  get(key: typeof COSEKeyParam.base_iv): Uint8Array | undefined;

  // EC2 / OKP Key Type Parameters (kty = 1 or 2)

  /**
   * Curve (crv) - EC identifier for the curve used with the key.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-13.1
   * Common values: COSEKeyCurveName['P-256'] (1), COSEKeyCurveName['P-384'] (2), COSEKeyCurveName['P-521'] (3)
   */
  get(key: typeof COSEKeyTypeParam.EC_crv): number | undefined;

  /**
   * X Coordinate (x) - X coordinate for the EC point.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-13.1.1
   */
  get(key: typeof COSEKeyTypeParam.EC_x): Uint8Array | undefined;

  /**
   * Y Coordinate (y) - Y coordinate for the EC point (may be boolean for point compression).
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-13.1.1
   */
  get(key: typeof COSEKeyTypeParam.EC_y): Uint8Array | boolean | undefined;

  /**
   * Private Key (d) - Private key value for EC2 or OKP keys.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-13.1.1
   */
  get(key: typeof COSEKeyTypeParam.EC_d): Uint8Array | undefined;

  // RSA Key Type Parameters (kty = 3)
  // Note: RSA uses the same parameter labels as EC2 but with different meanings

  /**
   * Modulus (n) - The RSA modulus n.
   * @see https://www.rfc-editor.org/rfc/rfc8230.html#section-4
   * Shares the same key label as EC_crv but different semantics.
   */
  get(key: typeof COSEKeyTypeParam.RSA_n): Uint8Array | undefined;

  /**
   * Exponent (e) - The RSA public exponent e.
   * @see https://www.rfc-editor.org/rfc/rfc8230.html#section-4
   * Shares the same key label as EC_x but different semantics.
   */
  get(key: typeof COSEKeyTypeParam.RSA_e): Uint8Array | undefined;
}
