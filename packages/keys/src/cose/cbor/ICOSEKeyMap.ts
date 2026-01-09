import type { TypedMap } from '@repo/types';

import type { COSEKeyParam } from '../enums/COSEKeyParam';
import type { COSEKeyTypeParam } from '../enums/COSEKeyTypeParam';

/**
 * COSE Key structure as defined in RFC 8152.
 * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7
 *
 * Note: Many key type parameters share the same numeric key (-1, -2, etc.)
 * across different key types (OKP, EC2, RSA, Symmetric, HSS-LMS, WalnutDSA, Dilithium).
 * The actual type depends on the kty value.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICOSEKeyMap
  extends TypedMap<{
    // Common COSE Key Parameters

    /**
     * Key Type (kty) - Identifies the family of keys for this structure.
     * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
     * Common values: COSEKeyType.EC (2), COSEKeyType.RSA (3)
     */
    [COSEKeyParam.kty]: number | undefined;

    /**
     * Key ID (kid) - Identification value matched to the kid in the message.
     * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
     */
    [COSEKeyParam.kid]: Uint8Array | undefined;

    /**
     * Algorithm (alg) - The algorithm that is used with the key.
     * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
     * Common values: COSEKeyAlgorithm.ES256 (-7), COSEKeyAlgorithm.RS256 (-257)
     */
    [COSEKeyParam.alg]: number | undefined;

    /**
     * Key Operations (key_ops) - Restricts the set of operations that a key is to be used for.
     * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
     */
    [COSEKeyParam.key_ops]: number[] | undefined;

    /**
     * Base IV (base_iv) - Base initialization vector to be XORed with partial IVs.
     * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
     */
    [COSEKeyParam.base_iv]: Uint8Array | undefined;

    // Key Type Parameters (key = -1)
    // Shared by: OKP_crv, EC_crv, RSA_n, HSS_LMS_pub, WalnutDSA_N, Dilithium_pub

    /**
     * Parameter at key -1.
     * - OKP: crv (curve identifier)
     * - EC2: crv (curve identifier)
     * - RSA: n (modulus)
     * - HSS-LMS: pub (public key)
     * - WalnutDSA: N (group and matrix size)
     * - Dilithium: pub (public key)
     */
    [COSEKeyTypeParam.EC_crv]: number | Uint8Array | undefined;

    // Key Type Parameters (key = -2)
    // Shared by: OKP_x, EC_x, RSA_e, WalnutDSA_q

    /**
     * Parameter at key -2.
     * - OKP: x (public key)
     * - EC2: x (x-coordinate)
     * - RSA: e (public exponent)
     * - WalnutDSA: q (finite field)
     */
    [COSEKeyTypeParam.EC_x]: Uint8Array | number | undefined;

    // Key Type Parameters (key = -3)
    // Shared by: EC_y, WalnutDSA_t_values

    /**
     * Parameter at key -3.
     * - EC2: y (y-coordinate, may be boolean for point compression)
     * - WalnutDSA: t_values (list of T-values)
     */
    [COSEKeyTypeParam.EC_y]: Uint8Array | boolean | number[] | undefined;
  }> {}
