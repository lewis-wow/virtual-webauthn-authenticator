import type { ValueOfEnum } from '@repo/types';

/**
 * WebCrypto hash algorithm names.
 *
 * These are the standard hash algorithm identifiers used by the
 * Web Cryptography API's SubtleCrypto interface.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#supported_algorithms
 */
export const SubtleCryptoAlg = {
  'SHA-1': 'SHA-1',
  'SHA-256': 'SHA-256',
  'SHA-384': 'SHA-384',
  'SHA-512': 'SHA-512',
} as const;

export type SubtleCryptoAlg = ValueOfEnum<typeof SubtleCryptoAlg>;
