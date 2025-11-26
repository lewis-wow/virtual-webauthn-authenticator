import { Schema } from 'effect';

import { see } from '../meta/see';
// Assuming these have also been converted to Effect Schemas
import { AuthenticatorAttachmentSchema } from './enums/AuthenticatorAttachmentSchema';
import { ResidentKeyRequirementSchema } from './enums/ResidentKeyRequirementSchema';
import { UserVerificationRequirementSchema } from './enums/UserVerificationRequirementSchema';

/**
 * WebAuthn Relying Parties may use the AuthenticatorSelectionCriteria dictionary
 * to specify their requirements regarding authenticator attributes.
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-authenticatorselectioncriteria
 */
export const AuthenticatorSelectionCriteriaSchema = Schema.Struct({
  /**
   * If this member is present, eligible authenticators are filtered to
   * only authenticators attached with the specified in enum AuthenticatorAttachment.
   */
  authenticatorAttachment: Schema.optional(AuthenticatorAttachmentSchema),

  /**
   * @deprecated
   */
  requireResidentKey: Schema.optional(Schema.Boolean).annotations({
    jsonSchema: { deprecated: true },
  }),

  /**
   * @deprecated
   */
  residentKey: Schema.optional(ResidentKeyRequirementSchema).annotations({
    jsonSchema: { deprecated: true },
  }),

  /**
   * This member describes the Relying Party's requirements regarding user verification for the create() operation.
   * Eligible authenticators are filtered to only those capable of satisfying this requirement.
   * The value SHOULD be a member of UserVerificationRequirement but client platforms MUST ignore unknown values,
   * treating an unknown value as if the member does not exist.
   */
  userVerification: Schema.optional(UserVerificationRequirementSchema),
}).annotations({
  identifier: 'AuthenticatorSelectionCriteria',
  title: 'AuthenticatorSelectionCriteria',
  description: `Specifies requirements for the authenticator. ${see(
    'https://www.w3.org/TR/webauthn/#dictdef-authenticatorselectioncriteria',
  )}`,
});

export type AuthenticatorSelectionCriteria = Schema.Schema.Type<
  typeof AuthenticatorSelectionCriteriaSchema
>;
