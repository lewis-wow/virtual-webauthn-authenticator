import { ValueOf } from '@repo/types';

/**
 * @see https://w3c.github.io/webauthn/#enum-attestation-conveyance-preference
 */
export const Attestation = {
  NONE: 'none',
  DIRECT: 'direct',
  ENTERPRISE: 'enterprise',
  INDIRECT: 'indirect',
} as const;

export type Attestation = ValueOf<typeof Attestation>;
