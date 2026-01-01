import z from 'zod';

import { PublicKeyCredentialCreationOptionsSchema } from './PublicKeyCredentialCreationOptionsSchema';
import { CredentialMediationRequirementSchema } from './enums/CredentialMediationRequirementSchema';

export const CredentialCreationOptionsSchema = z.object({
  mediation: CredentialMediationRequirementSchema.optional(),
  publicKey: PublicKeyCredentialCreationOptionsSchema.optional(),
  signal: z.instanceof(AbortSignal).optional(),
});

export type CredentialCreationOptions = z.infer<
  typeof CredentialCreationOptionsSchema
>;
