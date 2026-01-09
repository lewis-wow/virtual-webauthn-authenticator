import type { ValueOfEnum } from '@repo/types';

import { SharedKeyAlgorithm } from '../../shared/enums/SharedKeyAlgorithm';

/**
 * COSE Algorithm Identifiers (alg).
 *
 * Defines the standard integer identifiers for cryptographic algorithms used in
 * WebAuthn, COSE, and CWT.
 *
 * Source: IANA COSE Algorithms Registry (as of provided snapshot).
 *
 * @see https://www.iana.org/assignments/cose/cose.xhtml#algorithms
 */
export const COSEKeyAlgorithm = {
  // --- Encryption / MAC Algorithms (Positive IDs) ---
  // NOTE: Not implemented. WebAuthn do not need Encryption / MAC Algorithms

  // AES-CCM mode 256-bit key, 128-bit tag, 7-byte nonce.
  // AES_CCM_64_128_256: 33,

  // AES-CCM mode 128-bit key, 128-bit tag, 7-byte nonce.
  // AES_CCM_64_128_128: 32,

  // AES-CCM mode 256-bit key, 128-bit tag, 13-byte nonce.
  // AES_CCM_16_128_256: 31,

  // AES-CCM mode 128-bit key, 128-bit tag, 13-byte nonce.
  // AES_CCM_16_128_128: 30,

  // AES-MAC 256-bit key, 128-bit tag.
  // AES_MAC_256_128: 26,

  // AES-MAC 128-bit key, 128-bit tag.
  // AES_MAC_128_128: 25,

  // ChaCha20/Poly1305 w/ 256-bit key, 128-bit tag.
  // ChaCha20_Poly1305: 24,

  // AES-MAC 256-bit key, 64-bit tag.
  // AES_MAC_256_64: 15,

  // AES-MAC 128-bit key, 64-bit tag.
  // AES_MAC_128_64: 14,

  // AES-CCM mode 256-bit key, 64-bit tag, 7-byte nonce.
  // AES_CCM_64_64_256: 13,

  // AES-CCM mode 128-bit key, 64-bit tag, 7-byte nonce.
  // AES_CCM_64_64_128: 12,

  // AES-CCM mode 256-bit key, 64-bit tag, 13-byte nonce.
  // AES_CCM_16_64_256: 11,

  // AES-CCM mode 128-bit key, 64-bit tag, 13-byte nonce.
  // AES_CCM_16_64_128: 10,

  // HMAC w/ SHA-512.
  // HMAC_512_512: 7,

  // HMAC w/ SHA-384.
  // HMAC_384_384: 6,

  // HMAC w/ SHA-256.
  // HMAC_256_256: 5,

  // HMAC w/ SHA-256 truncated to 64 bits.
  // HMAC_256_64: 4,

  // AES-GCM mode w/ 256-bit key, 128-bit tag.
  // A256GCM: 3,

  // AES-GCM mode w/ 192-bit key, 128-bit tag.
  // A192GCM: 2,

  // AES-GCM mode w/ 128-bit key, 128-bit tag.
  // A128GCM: 1,

  // --- Signature / Key Wrap / KDF Algorithms (Negative IDs) ---

  /**
   * AES Key Wrap w/ 128-bit key.
   *
   * NOTE: Not implemented / supported.
   */
  // A128KW: -3,

  /**
   * AES Key Wrap w/ 192-bit key.
   *
   * NOTE: Not implemented / supported.
   */
  // A192KW: -4,

  /**
   * AES Key Wrap w/ 256-bit key.
   *
   * NOTE: Not implemented / supported.
   */
  // A256KW: -5,

  /**
   * Direct use of CEK.
   *
   * NOTE: Not implemented / supported.
   */
  // Direct: -6,

  /**
   * ECDSA w/ SHA-256.
   * Status: Deprecated (in some contexts, but widely used in WebAuthn).
   */
  [SharedKeyAlgorithm.ES256]: -7,

  /**
   * EdDSA (Ed25519).
   * Used with OKP keys on Ed25519 curve.
   */
  [SharedKeyAlgorithm.EdDSA]: -8,

  /**
   * ECDSA using P-256 curve and SHA-256.
   *
   * NOTE: Not implemented / supported.
   */
  // ESP256: -9,

  /**
   * Shared secret w/ HKDF and SHA-256.
   *
   * NOTE: Not implemented / supported.
   */
  // Direct_HKDF_SHA_256: -10,

  /**
   * Shared secret w/ HKDF and SHA-512.
   *
   * NOTE: Not implemented / supported.
   */
  // Direct_HKDF_SHA_512: -11,

  /**
   * Shared secret w/ AES-MAC 128-bit key.
   *
   * NOTE: Not implemented / supported.
   */
  // Direct_HKDF_AES_128: -12,

  /**
   * Shared secret w/ AES-MAC 256-bit key.
   *
   * NOTE: Not implemented / supported.
   */
  // Direct_HKDF_AES_256: -13,

  /**
   * SHA-1 Hash.
   * Status: Filter Only.
   *
   * NOTE: Not implemented / supported.
   */
  // SHA_1: -14,

  /**
   * SHA-2 256-bit Hash truncated to 64-bits.
   * Status: Filter Only.
   *
   * NOTE: Not implemented / supported.
   */
  // SHA_256_64: -15,

  /**
   * SHA-2 256-bit Hash.
   *
   * NOTE: Not implemented / supported.
   */
  // SHA_256: -16,

  /**
   * SHA-2 512-bit Hash truncated to 256-bits.
   *
   * NOTE: Not implemented / supported.
   */
  // SHA_512_256: -17,

  /**
   * SHAKE-128 256-bit Hash Value.
   *
   * NOTE: Not implemented / supported.
   */
  // SHAKE128: -18,

  /**
   * EdDSA using the Ed25519 parameter set in Section 5.1 of RFC8032.
   *
   * NOTE: Not implemented / supported.
   */
  // Ed25519: -19,

  /**
   * ECDH ES w/ HKDF - generate key directly (256).
   *
   * NOTE: Not implemented / supported.
   */
  // ECDH_ES_HKDF_256: -25,

  /**
   * ECDH ES w/ HKDF - generate key directly (512).
   *
   * NOTE: Not implemented / supported.
   */
  // ECDH_ES_HKDF_512: -26,

  /**
   * ECDH SS w/ HKDF - generate key directly (256).
   *
   * NOTE: Not implemented / supported.
   */
  // ECDH_SS_HKDF_256: -27,

  /**
   * ECDH SS w/ HKDF - generate key directly (512).
   *
   * NOTE: Not implemented / supported.
   */
  // ECDH_SS_HKDF_512: -28,

  /**
   * ECDH ES w/ Concat KDF and AES Key Wrap w/ 128-bit key.
   *
   * NOTE: Not implemented / supported.
   */
  // ECDH_ES_A128KW: -29,

  /**
   * ECDH ES w/ Concat KDF and AES Key Wrap w/ 192-bit key.
   *
   * NOTE: Not implemented / supported.
   */
  // ECDH_ES_A192KW: -30,

  /**
   * ECDH ES w/ Concat KDF and AES Key Wrap w/ 256-bit key.
   *
   * NOTE: Not implemented / supported.
   */
  // ECDH_ES_A256KW: -31,

  /**
   * ECDH SS w/ Concat KDF and AES Key Wrap w/ 128-bit key.
   *
   * NOTE: Not implemented / supported.
   */
  // ECDH_SS_A128KW: -32,

  /**
   * ECDH SS w/ Concat KDF and AES Key Wrap w/ 192-bit key.
   *
   * NOTE: Not implemented / supported.
   */
  // ECDH_SS_A192KW: -33,

  /**
   * ECDH SS w/ Concat KDF and AES Key Wrap w/ 256-bit key.
   *
   * NOTE: Not implemented / supported.
   */
  // ECDH_SS_A256KW: -34,

  /**
   * ECDSA w/ SHA-384.
   * Status: Deprecated (in IETF context).
   */
  [SharedKeyAlgorithm.ES384]: -35,

  /**
   * ECDSA w/ SHA-512.
   * Status: Deprecated (in IETF context).
   */
  [SharedKeyAlgorithm.ES512]: -36,

  /**
   * RSASSA-PSS w/ SHA-256.
   */
  [SharedKeyAlgorithm.PS256]: -37,

  /**
   * RSASSA-PSS w/ SHA-384.
   */
  [SharedKeyAlgorithm.PS384]: -38,

  /**
   * RSASSA-PSS w/ SHA-512.
   */
  [SharedKeyAlgorithm.PS512]: -39,

  /**
   * RSAES-OAEP w/ SHA-1 (RFC 8017 default parameters).
   *
   * NOTE: Not implemented / supported.
   */
  // RSAES_OAEP_SHA_1: -40,

  /**
   * RSAES-OAEP w/ SHA-256.
   *
   * NOTE: Not implemented / supported.
   */
  // RSAES_OAEP_SHA_256: -41,

  /**
   * RSAES-OAEP w/ SHA-512.
   *
   * NOTE: Not implemented / supported.
   */
  // RSAES_OAEP_SHA_512: -42,

  /**
   * SHA-2 384-bit Hash.
   *
   * NOTE: Not implemented / supported.
   */
  // SHA_384: -43,

  /**
   * SHA-2 512-bit Hash.
   *
   * NOTE: Not implemented / supported.
   */
  // SHA_512: -44,

  /**
   * SHAKE-256 512-bit Hash Value.
   *
   * NOTE: Not implemented / supported.
   */
  // SHAKE256: -45,

  /**
   * HSS/LMS hash-based digital signature.
   *
   * NOTE: Not implemented / supported.
   */
  // HSS_LMS: -46,

  /**
   * ECDSA using secp256k1 curve and SHA-256.
   * Status: No (IESG).
   *
   * NOTE: Not implemented / supported.
   */
  // ES256K: -47,

  /**
   * CBOR Object Signing Algorithm for ML-DSA-44.
   *
   * NOTE: Not implemented / supported.
   */
  // ML_DSA_44: -48,

  /**
   * CBOR Object Signing Algorithm for ML-DSA-65.
   *
   * NOTE: Not implemented / supported.
   */
  // ML_DSA_65: -49,

  /**
   * CBOR Object Signing Algorithm for ML-DSA-87.
   *
   * NOTE: Not implemented / supported.
   */
  // ML_DSA_87: -50,

  /**
   * ECDSA using P-384 curve and SHA-384.
   *
   * NOTE: Not implemented / supported.
   */
  // ESP384: -51,

  /**
   * ECDSA using P-521 curve and SHA-512.
   *
   * NOTE: Not implemented / supported.
   */
  // ESP512: -52,

  /**
   * EdDSA using the Ed448 parameter set in Section 5.2 of RFC8032.
   *
   * NOTE: Not implemented / supported.
   */
  // Ed448: -53,

  /**
   * RSASSA-PKCS1-v1_5 using SHA-256.
   * Status: No (IESG).
   */
  [SharedKeyAlgorithm.RS256]: -257,

  /**
   * RSASSA-PKCS1-v1_5 using SHA-384.
   * Status: No (IESG).
   */
  [SharedKeyAlgorithm.RS384]: -258,

  /**
   * RSASSA-PKCS1-v1_5 using SHA-512.
   * Status: No (IESG).
   */
  [SharedKeyAlgorithm.RS512]: -259,

  /**
   * WalnutDSA signature.
   * Status: No.
   *
   * NOTE: Not implemented / supported.
   */
  // WalnutDSA: -260,

  /**
   * TurboSHAKE128 XOF.
   * Status: No.
   *
   * NOTE: Not implemented / supported.
   */
  // TurboSHAKE128: -261,

  /**
   * TurboSHAKE256 XOF.
   * Status: No.
   *
   * NOTE: Not implemented / supported.
   */
  // TurboSHAKE256: -262,

  /**
   * KT128 XOF.
   * Status: No.
   *
   * NOTE: Not implemented / supported.
   */
  // KT128: -263,

  /**
   * KT256 XOF.
   * Status: No.
   *
   * NOTE: Not implemented / supported.
   */
  // KT256: -264,

  /**
   * ECDSA using BrainpoolP256r1 curve and SHA-256.
   * Status: No.
   *
   * NOTE: Not implemented / supported.
   */
  // ESB256: -265,

  /**
   * ECDSA using BrainpoolP320r1 curve and SHA-384.
   * Status: No.
   *
   * NOTE: Not implemented / supported.
   */
  // ESB320: -266,

  /**
   * ECDSA using BrainpoolP384r1 curve and SHA-384.
   * Status: No.
   *
   * NOTE: Not implemented / supported.
   */
  // ESB384: -267,

  /**
   * ECDSA using BrainpoolP512r1 curve and SHA-512.
   * Status: No.
   *
   * NOTE: Not implemented / supported.
   */
  // ESB512: -268,

  // --- Deprecated / Legacy Algorithms (High Negative IDs) ---

  /**
   * AES-CBC w/ 256-bit key.
   * Status: Deprecated.
   * @deprecated
   *
   * NOTE: Not implemented / supported.
   */
  // A256CBC: -65529,

  /**
   * AES-CBC w/ 192-bit key.
   * Status: Deprecated.
   * @deprecated
   *
   * NOTE: Not implemented / supported.
   */
  // A192CBC: -65530,

  /**
   * AES-CBC w/ 128-bit key.
   * Status: Deprecated.
   * @deprecated
   *
   * NOTE: Not implemented / supported.
   */
  // A128CBC: -65531,

  /**
   * AES-CTR w/ 256-bit key.
   * Status: Deprecated.
   * @deprecated
   *
   * NOTE: Not implemented / supported.
   */
  // A256CTR: -65532,

  /**
   * AES-CTR w/ 192-bit key.
   * Status: Deprecated.
   * @deprecated
   *
   * NOTE: Not implemented / supported.
   */
  // A192CTR: -65533,

  /**
   * AES-CTR w/ 128-bit key.
   * Status: Deprecated.
   * @deprecated
   *
   * NOTE: Not implemented / supported.
   */
  // A128CTR: -65534,

  /**
   * RSASSA-PKCS1-v1_5 using SHA-1.
   * Status: Deprecated.
   * @deprecated
   *
   * NOTE: Not implemented / supported.
   */
  // RS1: -65535,
} as const satisfies Record<SharedKeyAlgorithm, unknown>;

export type COSEKeyAlgorithm = ValueOfEnum<typeof COSEKeyAlgorithm>;
