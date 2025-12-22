import z from 'zod';

import { PublicKeyCredentialCreationOptionsSchema } from './PublicKeyCredentialCreationOptionsSchema';

export const CredentialCreationOptionsSchema = z.object({
  publicKey: PublicKeyCredentialCreationOptionsSchema.optional(),
  signal: z.instanceof(AbortSignal).optional(),
});

export type CredentialCreationOptions = z.infer<
  typeof CredentialCreationOptionsSchema
>;
