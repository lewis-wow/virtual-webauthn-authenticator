import type { ValueOfEnum } from '@repo/types';

/**
 * COSE RSA Key Parameters.
 *
 * Defines the integer keys used for RSA specific parameters in a COSE Key map.
 *
 * * **n** (label: `-1`, type: `bstr`) - The RSA modulus n.
 * * **e** (label: `-2`, type: `bstr`) - The RSA public exponent e.
 * * **d** (label: `-3`, type: `bstr`) - The RSA private exponent d.
 * * **p** (label: `-4`, type: `bstr`) - The prime factor p of n.
 * * **q** (label: `-5`, type: `bstr`) - The prime factor q of n.
 * * **dP** (label: `-6`, type: `bstr`) - dP is d mod (p - 1).
 * * **dQ** (label: `-7`, type: `bstr`) - dQ is d mod (q - 1).
 * * **qInv** (label: `-8`, type: `bstr`) - qInv is the CRT coefficient q^(-1) mod p.
 * * **other** (label: `-9`, type: `array`) - Other prime infos, an array of maps.
 * * **r_i** (label: `-10`, type: `bstr`) - A prime factor r_i of n, where i >= 3.
 * * **d_i** (label: `-11`, type: `bstr`) - d_i = d mod (r_i - 1).
 * * **t_i** (label: `-12`, type: `bstr`) - The CRT coefficient t_i = (r_1 * ... * r_(i-1))^(-1) mod r_i.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc8230#section-4
 */
export const COSEKeyRsaParam = {
  /**
   * RSA modulus n.
   */
  n: -1,

  /**
   * RSA public exponent e.
   */
  e: -2,

  /**
   * RSA private exponent d.
   */
  d: -3,

  /**
   * RSA secret prime p.
   */
  p: -4,

  /**
   * RSA secret prime q.
   */
  q: -5,

  /**
   * RSA private key parameter dP.
   * First Factor CRT Exponent (d mod (p - 1)).
   */
  dp: -6,

  /**
   * RSA private key parameter dQ.
   * Second Factor CRT Exponent (d mod (q - 1)).
   */
  dq: -7,

  /**
   * RSA private key parameter qInv (qi).
   * First CRT Coefficient (q^(-1) mod p).
   */
  qi: -8,

  /**
   * Other Prime Info.
   * Used for multi-prime RSA.
   */
  other: -9,

  /**
   * A prime factor r_i of n, where i >= 3.
   * (Used inside 'other' map).
   */
  ri: -10,

  /**
   * d_i = d mod (r_i - 1).
   * (Used inside 'other' map).
   */
  di: -11,

  /**
   * The CRT coefficient t_i.
   * (Used inside 'other' map).
   */
  ti: -12,
} as const;

export type COSEKeyRsaParam = ValueOfEnum<typeof COSEKeyRsaParam>;
