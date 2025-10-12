import type { IAuthenticatorResponse } from '@repo/types';
import z from 'zod';

export const AuthenticatorResponseSchema = z.object({
  clientDataJSON: z.instanceof(Buffer),
}) satisfies z.ZodType<IAuthenticatorResponse>;
