import z from 'zod';

import { PublicKeyCredentialRequestOptionsSchema } from './PublicKeyCredentialRequestOptionsSchema';
import { CredentialMediationRequirementSchema } from './enums/CredentialMediationRequirementSchema';

export const CredentialRequestOptionsSchema = z.object({
  mediation: CredentialMediationRequirementSchema,
  publicKey: PublicKeyCredentialRequestOptionsSchema.optional(),
  signal: z.instanceof(AbortSignal).optional(),
});

export type CredentialRequestOptions = z.infer<
  typeof CredentialRequestOptionsSchema
>;
