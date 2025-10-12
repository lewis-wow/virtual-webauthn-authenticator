import type { IPublicKeyCredentialJSONResponse } from '@repo/types';
import z from 'zod';

export const PublicKeyCredentialJSONResponseSchema = z.object({
  clientDataJSON: z.string(),
  attestationObject: z.string().optional(),
  authenticatorData: z.string().optional(),
  signature: z.string().optional(),
  userHandle: z.string().optional(),
}) satisfies z.ZodType<IPublicKeyCredentialJSONResponse>;
