import z from 'zod';

import type { ValueOfEnum } from '../types.js';

/**
 * @see https://w3c.github.io/webauthn/#enum-attestation-conveyance-preference
 */
export const Attestation = {
  NONE: 'none',
  DIRECT: 'direct',
  ENTERPRISE: 'enterprise',
  INDIRECT: 'indirect',
} as const;

export type Attestation = ValueOfEnum<typeof Attestation>;

export const AttestationSchema = z.enum(Attestation).meta({
  description: 'Attestation',
});
