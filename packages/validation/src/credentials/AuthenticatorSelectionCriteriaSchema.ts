import {
  AuthenticatorAttachmentSchema,
  ResidentKeyRequirementSchema,
  UserVerificationRequirementSchema,
} from '@repo/enums';
import type { IAuthenticatorSelectionCriteria } from '@repo/types';
import z from 'zod';

// Specifies requirements for the authenticator
export const AuthenticatorSelectionCriteriaSchema = z
  .object({
    authenticatorAttachment: AuthenticatorAttachmentSchema.optional(),
    requireResidentKey: z.boolean().optional(),
    residentKey: ResidentKeyRequirementSchema.optional(),
    userVerification: UserVerificationRequirementSchema.optional(),
  })
  .meta({
    id: 'AuthenticatorSelectionCriteria',
    description:
      'Specifies requirements for the authenticator. For more information, see https://www.w3.org/TR/webauthn/#dictdef-authenticatorselectioncriteria.',
  }) satisfies z.ZodType<IAuthenticatorSelectionCriteria>;
