import type { IAuthenticatorResponse } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';

export const AuthenticatorResponseSchema = z.object({
  clientDataJSON: Base64URLBufferSchema,
}).meta({
  description: 'The response from an authenticator.',
}) satisfies z.ZodType<IAuthenticatorResponse>;
