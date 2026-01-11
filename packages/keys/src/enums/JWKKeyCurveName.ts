import type { ValueOfEnum } from '@repo/types';

export const JWKKeyCurveName = {
  ['P-256']: 'P-256',
  ['P-384']: 'P-384',
  ['P-521']: 'P-521',
  Ed25519: 'Ed25519',
} as const;

export type JWKKeyCurveName = ValueOfEnum<typeof JWKKeyCurveName>;
