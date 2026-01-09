import z from 'zod';

import { CredentialMediationRequirementSchema } from '../enums/CredentialMediationRequirementSchema';
import { PublicKeyCredentialCreationOptionsSchema } from './PublicKeyCredentialCreationOptionsSchema';

export const CredentialCreationOptionsSchema = z.object({
  mediation: CredentialMediationRequirementSchema.optional(),
  publicKey: PublicKeyCredentialCreationOptionsSchema.optional(),
  signal: z.instanceof(AbortSignal).optional(),
});

export type CredentialCreationOptions = z.infer<
  typeof CredentialCreationOptionsSchema
>;
