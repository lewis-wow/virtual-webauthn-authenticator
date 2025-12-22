import type { ValueOfEnum } from '@repo/types';

export const CredentialMediationRequirement = {
  CONDITIONAL: 'conditional',
  OPTIONAL: 'optional',
  REQUIRED: 'required',
  SILENT: 'silent',
} as const;

export type CredentialMediationRequirement = ValueOfEnum<
  typeof CredentialMediationRequirement
>;
