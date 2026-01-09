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
    // Shared by: OKP_crv, EC_crv, RSA_n, Symmetric_k, HSS_LMS_pub, WalnutDSA_N, Dilithium_pub

    /**
     * Parameter at key -1.
     * - OKP: crv (curve identifier)
     * - EC2: crv (curve identifier)
     * - RSA: n (modulus)
     * - Symmetric: k (key value)
     * - HSS-LMS: pub (public key)
     * - WalnutDSA: N (group and matrix size)
     * - Dilithium: pub (public key)
     */
    [COSEKeyTypeParam.EC_crv]: number | Uint8Array | undefined;

    // Key Type Parameters (key = -2)
    // Shared by: OKP_x, EC_x, RSA_e, WalnutDSA_q, Dilithium_priv

    /**
     * Parameter at key -2.
     * - OKP: x (public key)
     * - EC2: x (x-coordinate)
     * - RSA: e (public exponent)
     * - WalnutDSA: q (finite field)
     * - Dilithium: priv (private key)
     */
    [COSEKeyTypeParam.EC_x]: Uint8Array | number | undefined;

    // Key Type Parameters (key = -3)
    // Shared by: EC_y, RSA_d, WalnutDSA_t_values

    /**
     * Parameter at key -3.
     * - EC2: y (y-coordinate, may be boolean for point compression)
     * - RSA: d (private exponent)
     * - WalnutDSA: t_values (list of T-values)
     */
    [COSEKeyTypeParam.EC_y]: Uint8Array | boolean | number[] | undefined;

    // Key Type Parameters (key = -4)
    // Shared by: OKP_d, EC_d, RSA_p, WalnutDSA_matrix_1

    /**
     * Parameter at key -4.
     * - OKP: d (private key)
     * - EC2: d (private key)
     * - RSA: p (prime factor p of n)
     * - WalnutDSA: matrix_1 (NxN matrix)
     */
    [COSEKeyTypeParam.EC_d]: Uint8Array | number[][] | undefined;

    // Key Type Parameters (key = -5)
    // Shared by: RSA_q, WalnutDSA_permutation_1

    /**
     * Parameter at key -5.
     * - RSA: q (prime factor q of n)
     * - WalnutDSA: permutation_1 (permutation)
     */
    [COSEKeyTypeParam.RSA_q]: Uint8Array | number[] | undefined;

    // Key Type Parameters (key = -6)
    // Shared by: RSA_dP, WalnutDSA_matrix_2

    /**
     * Parameter at key -6.
     * - RSA: dP (d mod (p - 1))
     * - WalnutDSA: matrix_2 (NxN matrix)
     */
    [COSEKeyTypeParam.RSA_dP]: Uint8Array | number[][] | undefined;

    // Key Type Parameters (key = -7)
    // RSA only

    /**
     * RSA dQ (d mod (q - 1)).
     * @see https://www.rfc-editor.org/rfc/rfc8230.html#section-4
     */
    [COSEKeyTypeParam.RSA_dQ]: Uint8Array | undefined;

    // Key Type Parameters (key = -8)
    // RSA only

    /**
     * RSA qInv (CRT coefficient q^(-1) mod p).
     * @see https://www.rfc-editor.org/rfc/rfc8230.html#section-4
     */
    [COSEKeyTypeParam.RSA_qInv]: Uint8Array | undefined;

    // Key Type Parameters (key = -9)
    // RSA only

    /**
     * RSA Other prime infos.
     * @see https://www.rfc-editor.org/rfc/rfc8230.html#section-4
     */
    [COSEKeyTypeParam.RSA_other]: unknown[] | undefined;
  }> {}
