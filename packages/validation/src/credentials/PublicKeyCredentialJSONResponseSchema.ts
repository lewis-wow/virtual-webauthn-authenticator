import type { IPublicKeyCredentialJSONResponse } from '@repo/types';
import z from 'zod';

export const PublicKeyCredentialJSONResponseSchema = z.object({
  clientDataJSON: z.string(),
  attestationObject: z.string().optional(),
  authenticatorData: z.string().optional(),
  signature: z.string().optional(),
  userHandle: z.string().optional(),
}).meta({
  description: 'The response from a public key credential operation.',
}) satisfies z.ZodType<IPublicKeyCredentialJSONResponse>;
