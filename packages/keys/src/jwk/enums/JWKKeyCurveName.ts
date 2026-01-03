import type { ValueOfEnum } from '@repo/types';

export const JWKKeyCurveName = {
  P256: 'P-256',
  P384: 'P-384',
  P521: 'P-521',
  Ed25519: 'Ed25519',
} as const;

export type JWKKeyCurveName = ValueOfEnum<typeof JWKKeyCurveName>;
