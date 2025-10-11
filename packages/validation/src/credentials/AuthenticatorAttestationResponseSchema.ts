import type { IAuthenticatorAttestationResponse } from '@repo/types';
import z from 'zod';
import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';

/**
 * Corresponds to: `IAuthenticatorAttestationResponse`
 * This represents the JSON payload for a registration verification.
 */
export const AuthenticatorAttestationResponseSchema = z.object({
  clientDataJSON: Base64URLBufferSchema,
  attestationObject: Base64URLBufferSchema,
}) satisfies z.ZodType<IAuthenticatorAttestationResponse>;
