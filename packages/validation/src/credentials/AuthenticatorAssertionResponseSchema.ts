import type { IAuthenticatorAssertionResponse } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';

/**
 * Corresponds to: `IAuthenticatorAssertionResponse`
 * This represents the JSON payload for an authentication verification.
 */
export const AuthenticatorAssertionResponseSchema = z
  .object({
    clientDataJSON: Base64URLBufferSchema.meta({ description: 'The client data for the assertion.' }),
    authenticatorData: Base64URLBufferSchema.meta({ description: 'The authenticator data for the assertion.' }),
    signature: Base64URLBufferSchema.meta({ description: 'The signature for the assertion.' }),
    userHandle: Base64URLBufferSchema.meta({ description: 'The user handle for the assertion.' }).nullable(),
  })
  .meta({
    id: 'AuthenticatorAssertionResponse',
    description: 'The JSON payload for an authentication verification.',
  }) satisfies z.ZodType<IAuthenticatorAssertionResponse>;
