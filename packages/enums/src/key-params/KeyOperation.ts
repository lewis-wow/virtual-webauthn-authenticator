import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

export const KeyOperation = {
  /** Indicates that the key can be used to encrypt. */
  ENCRYPT: 'encrypt',
  /** Indicates that the key can be used to decrypt. */
  DECRYPT: 'decrypt',
  /** Indicates that the key can be used to sign. */
  SIGN: 'sign',
  /** Indicates that the key can be used to verify. */
  VERIFY: 'verify',
  /** Indicates that the key can be used to wrap another key. */
  WRAP_KEY: 'wrapKey',
  /** Indicates that the key can be used to unwrap another key. */
  UNWRAP_KEY: 'unwrapKey',
  /** Indicates that the key can be imported during creation. */
  IMPORT: 'import',
  /** Indicates that the private component of the key can be exported. */
  EXPORT: 'export',
} as const;

export type KeyOperation = ValueOfEnum<typeof KeyOperation>;

export const KeyOperationSchema = z.enum(KeyOperation).meta({
  description: 'Key operation',
  examples: [KeyOperation.ENCRYPT],
});
