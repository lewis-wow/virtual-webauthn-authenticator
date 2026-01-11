import type { ValueOfEnum } from '@repo/types';

/**
 * WebCrypto key algorithm names.
 *
 * These are the standard key algorithm identifiers used by the
 * Web Cryptography API's SubtleCrypto interface for signature operations.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign#supported_algorithms
 */
export const SubtleCryptoKeyAlgName = {
  Ed25519: 'Ed25519',
  ECDSA: 'ECDSA',
  'RSASSA-PKCS1-v1_5': 'RSASSA-PKCS1-v1_5',
  'RSA-PSS': 'RSA-PSS',
} as const;

export type SubtleCryptoKeyAlgName = ValueOfEnum<typeof SubtleCryptoKeyAlgName>;
