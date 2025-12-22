import z from 'zod';

import { CredentialMediationRequirement } from '../../enums/CredentialMediationRequirement';

export const CredentialMediationRequirementSchema = z
  .enum(CredentialMediationRequirement)
  .meta({
    id: 'CredentialMediationRequirement',
    examples: [CredentialMediationRequirement.CONDITIONAL],
  });
