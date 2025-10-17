import type { IPublicKeyCredentialJSONResponse } from '@repo/types';
import z from 'zod';

export const PublicKeyCredentialJSONResponseSchema = z.object({
  clientDataJSON: z.string(),
  attestationObject: z.string().optional(),
  authenticatorData: z.string().optional(),
  signature: z.string().optional(),
  userHandle: z.string().optional(),
}).meta({
  id: 'PublicKeyCredentialJSONResponse',
  description: 'The response from a public key credential operation. For more information, see https://www.w3.org/TR/webauthn/#iface-pk-cred-json-response.',
}) satisfies z.ZodType<IPublicKeyCredentialJSONResponse>;
