import { Schema } from 'effect';

import { see } from '../meta/see';
import { AuthenticationExtensionsClientInputsSchema } from './AuthenticationExtensionsClientInputsSchema';
import { AuthenticatorSelectionCriteriaSchema } from './AuthenticatorSelectionCriteriaSchema';
import { ChallengeSchema } from './ChallengeSchema';
import { PubKeyCredParamLooseSchema } from './PubKeyCredParamSchema';
import { PublicKeyCredentialDescriptorSchema } from './PublicKeyCredentialDescriptorSchema';
import { PublicKeyCredentialRpEntitySchema } from './PublicKeyCredentialRpEntitySchema';
import { PublicKeyCredentialUserEntitySchema } from './PublicKeyCredentialUserEntitySchema';
import { AttestationSchema } from './enums/AttestationSchema';

/**
 * Zod schema for WebAuthn's PublicKeyCredentialCreationOptions.
 * This is sent from the server to the client to initiate passkey registration.
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialcreationoptions
 */
export const PublicKeyCredentialCreationOptionsSchema = Schema.Struct({
  rp: PublicKeyCredentialRpEntitySchema,
  user: PublicKeyCredentialUserEntitySchema,
  challenge: ChallengeSchema,
  pubKeyCredParams: Schema.mutable(
    Schema.Array(PubKeyCredParamLooseSchema),
  ).pipe(Schema.minItems(1)),
  timeout: Schema.optional(Schema.Number),
  excludeCredentials: Schema.optional(
    Schema.mutable(Schema.Array(PublicKeyCredentialDescriptorSchema)),
  ),
  authenticatorSelection: Schema.optional(AuthenticatorSelectionCriteriaSchema),
  attestation: Schema.optional(AttestationSchema),
  // Extensions can be complex; a generic record is often sufficient for validation
  extensions: Schema.optional(AuthenticationExtensionsClientInputsSchema),
}).annotations({
  identifier: 'PublicKeyCredentialCreationOptions',
  ref: 'PublicKeyCredentialCreationOptions',
  description: `Options for creating a new public key credential. ${see(
    'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialcreationoptions',
  )}`,
});

export type PublicKeyCredentialCreationOptions = Schema.Schema.Type<
  typeof PublicKeyCredentialCreationOptionsSchema
>;
