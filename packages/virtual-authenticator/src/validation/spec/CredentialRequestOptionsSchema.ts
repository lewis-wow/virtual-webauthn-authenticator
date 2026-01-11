import z from 'zod';

import { CredentialMediationRequirementSchema } from '../enums/CredentialMediationRequirementSchema';
import { PublicKeyCredentialRequestOptionsSchema } from './PublicKeyCredentialRequestOptionsSchema';

export const CredentialRequestOptionsSchema = z.object({
  mediation: CredentialMediationRequirementSchema.optional(),
  publicKey: PublicKeyCredentialRequestOptionsSchema.optional(),
  signal: z.instanceof(AbortSignal).optional(),
});

export type CredentialRequestOptions = z.infer<
  typeof CredentialRequestOptionsSchema
>;
