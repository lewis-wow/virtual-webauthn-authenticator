import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

/**
 * @see https://w3c.github.io/webauthn/#enum-attestation-conveyance-preference
 */
export const Attestation = {
  /**
   * Indicates that the Relying Party is not interested in receiving
   * attestation. This is the default value.
   * The authenticator may still generate and send an attestation
   * statement with a "none" format.
   */
  NONE: 'none',
  /**
   * Indicates that the Relying Party wants to receive the attestation
   * statement as generated directly by the authenticator (e.g., for
   * hardware verification).
   */
  DIRECT: 'direct',
  /**
   * Indicates that the Relying Party wants to receive an attestation
   * statement that may include uniquely identifying information.
   * This is intended for controlled enterprise deployments.
   */
  ENTERPRISE: 'enterprise',
  /**
   * Indicates that the Relying Party wants a verifiable attestation,
   * but allows the client or browser to anonymize the data
   * (e.g., by replacing a hardware-specific certificate with a
   * batch-level one).
   */
  INDIRECT: 'indirect',
} as const;

export type Attestation = ValueOfEnum<typeof Attestation>;

export const AttestationSchema = z.enum(Attestation).meta({
  description: 'Attestation',
  examples: [Attestation.NONE],
});
