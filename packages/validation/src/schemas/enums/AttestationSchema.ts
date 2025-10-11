import z from 'zod';
import { Attestation } from '@repo/enums';

/**
 * Corresponds to: `Attestation`
 */
export const AttestationSchema = z
  .enum(Attestation)
  .describe('The attestation conveyance preference.');
