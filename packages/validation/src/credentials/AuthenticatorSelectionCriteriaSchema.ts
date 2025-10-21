import {
  AuthenticatorAttachmentSchema,
  ResidentKeyRequirementSchema,
  UserVerificationRequirementSchema,
} from '@repo/enums';
import z from 'zod';

import { see } from '../meta/see';

/**
 * WebAuthn Relying Parties may use the AuthenticatorSelectionCriteria dictionary
 * to specify their requirements regarding authenticator attributes.
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-authenticatorselectioncriteria
 */
export const AuthenticatorSelectionCriteriaSchema = z
  .object({
    /**
     * If this member is present, eligible authenticators are filtered to
     * only authenticators attached with the specified in enum AuthenticatorAttachment.
     */
    authenticatorAttachment: AuthenticatorAttachmentSchema.optional(),
    /**
     * @deprecated
     */
    requireResidentKey: z.boolean().optional().meta({
      deprecated: true,
    }),
    /**
     * @deprecated
     */
    residentKey: ResidentKeyRequirementSchema.optional().meta({
      deprecated: true,
    }),
    /**
     * This member describes the Relying Party's requirements regarding user verification for the create() operation.
     * Eligible authenticators are filtered to only those capable of satisfying this requirement.
     * The value SHOULD be a member of UserVerificationRequirement but client platforms MUST ignore unknown values,
     * treating an unknown value as if the member does not exist.
     */
    userVerification: UserVerificationRequirementSchema.optional(),
  })
  .meta({
    id: 'AuthenticatorSelectionCriteria',
    description: `Specifies requirements for the authenticator. ${see(
      'https://www.w3.org/TR/webauthn/#dictdef-authenticatorselectioncriteria',
    )}`,
  });

export type AuthenticatorSelectionCriteria = z.infer<
  typeof AuthenticatorSelectionCriteriaSchema
>;
