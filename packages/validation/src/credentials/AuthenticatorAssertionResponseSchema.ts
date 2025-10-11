import type { IAuthenticatorAssertionResponse } from '@repo/types';
import z from 'zod';
import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';

/**
 * Corresponds to: `IAuthenticatorAssertionResponse`
 * This represents the JSON payload for an authentication verification.
 */
export const AuthenticatorAssertionResponseSchema = z.object({
  clientDataJSON: Base64URLBufferSchema,
  authenticatorData: Base64URLBufferSchema,
  signature: Base64URLBufferSchema,
  userHandle: Base64URLBufferSchema.nullable(),
}) satisfies z.ZodType<IAuthenticatorAssertionResponse>;
