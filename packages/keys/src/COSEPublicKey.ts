import type { TypedMap, Uint8Array_ } from '@repo/types';

import type { COSEKeyAlgorithm, COSEKeyCurveName, COSEKeyType } from './enums';
import type { COSEKeyParam } from './enums/COSEKeyParam';
import type { COSEKeyTypeParam } from './enums/COSEKeyTypeParam';

/**
 * COSE Key structure as defined in RFC 8152.
 * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7
 * @see https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/helpers/cose.ts
 *
 * Note: Many key type parameters share the same numeric key (-1, -2, etc.)
 * across different key types (OKP, EC2, RSA).
 * The actual type depends on the kty value.
 */
export type COSEPublicKey = TypedMap<{
  /**
   * Key Type (kty) - Identifies the family of keys for this structure.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
   * Common values: COSEKeyType.EC (2), COSEKeyType.RSA (3)
   */
  [COSEKeyParam.kty]: COSEKeyType | undefined;

  /**
   * Key ID (kid) - Identification value matched to the kid in the message.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
   */
  [COSEKeyParam.kid]: Uint8Array_ | undefined;

  /**
   * Algorithm (alg) - The algorithm that is used with the key.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
   * Common values: COSEKeyAlgorithm.ES256 (-7), COSEKeyAlgorithm.RS256 (-257)
   */
  [COSEKeyParam.alg]: COSEKeyAlgorithm | undefined;

  /**
   * Key Operations (key_ops) - Restricts the set of operations that a key is to be used for.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
   */
  [COSEKeyParam.key_ops]: number[] | undefined;

  /**
   * Base IV (base_iv) - Base initialization vector to be XORed with partial IVs.
   * @see https://www.rfc-editor.org/rfc/rfc8152.html#section-7.1
   */
  [COSEKeyParam.base_iv]: Uint8Array_ | undefined;
}>;

export type COSEPublicKeyOKP = COSEPublicKey &
  TypedMap<{
    /**
     * Parameter at key -1.
     * OKP: crv (curve identifier)
     */
    [COSEKeyTypeParam.crv]: COSEKeyCurveName | undefined;

    /**
     * Parameter at key -2.
     * OKP: x (public key)
     */
    [COSEKeyTypeParam.x]: Uint8Array_ | undefined;
  }>;

export type COSEPublicKeyEC = COSEPublicKey &
  TypedMap<{
    /**
     * Parameter at key -1.
     * EC2: crv (curve identifier)
     */
    [COSEKeyTypeParam.crv]: COSEKeyCurveName | undefined;

    /**
     * Parameter at key -2.
     * EC2: x (x-coordinate)
     */
    [COSEKeyTypeParam.x]: Uint8Array_ | undefined;

    /**
     * Parameter at key -3.
     * EC2: y (y-coordinate)
     */
    [COSEKeyTypeParam.y]: Uint8Array_ | undefined;
  }>;

export type COSEPublicKeyRSA = COSEPublicKey &
  TypedMap<{
    /**
     * Parameter at key -1.
     * RSA: n
     */
    [COSEKeyTypeParam.n]: Uint8Array_ | undefined;

    /**
     * Parameter at key -2.
     * RSA: e
     */
    [COSEKeyTypeParam.e]: Uint8Array_ | undefined;
  }>;
