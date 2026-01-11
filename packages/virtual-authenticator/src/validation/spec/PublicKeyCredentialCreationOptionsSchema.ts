import z from 'zod';

import { see } from '../../meta/see';
import { AttestationSchema } from '../enums/AttestationSchema';
import { AuthenticationExtensionsClientInputsSchema } from './AuthenticationExtensionsClientInputsSchema';
import { AuthenticatorSelectionCriteriaSchema } from './AuthenticatorSelectionCriteriaSchema';
import { ChallengeSchema } from './ChallengeSchema';
import { PubKeyCredParamLooseSchema } from './PubKeyCredParamSchema';
import { PublicKeyCredentialDescriptorSchema } from './PublicKeyCredentialDescriptorSchema';
import { PublicKeyCredentialRpEntityOptionsSchema } from './PublicKeyCredentialRpEntityOptionsSchema';
import { PublicKeyCredentialUserEntitySchema } from './PublicKeyCredentialUserEntitySchema';

/**
 * Zod schema for WebAuthn's PublicKeyCredentialCreationOptions.
 * This is sent from the server to the client to initiate passkey registration.
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialcreationoptions
 */
export const PublicKeyCredentialCreationOptionsSchema = z
  .object({
    rp: PublicKeyCredentialRpEntityOptionsSchema,
    user: PublicKeyCredentialUserEntitySchema,
    challenge: ChallengeSchema,
    // Per spec step 10: if empty array, ES256 (-7) and RS256 (-257) are used as defaults
    // @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (step 10)
    pubKeyCredParams: z.array(PubKeyCredParamLooseSchema),
    // timeout is unsigned long in milliseconds
    // range: 1 minute (60000ms) to 10 minutes (600000ms)
    // @see https://www.w3.org/TR/webauthn-3/#recommended-range-and-default-for-a-webauthn-ceremony-timeout
    timeout: z.number().int().min(60_000).max(600_000).optional(),
    excludeCredentials: z.array(PublicKeyCredentialDescriptorSchema).optional(),
    authenticatorSelection: AuthenticatorSelectionCriteriaSchema.optional(),
    // hints is an optional array of DOMString values from PublicKeyCredentialHint
    hints: z.array(z.string()).optional(),
    attestation: AttestationSchema.optional(),
    // attestationFormats is optional array of strings (format identifiers)
    attestationFormats: z.array(z.string()).optional(),
    // Extensions can be complex; a generic record is often sufficient for validation
    extensions: AuthenticationExtensionsClientInputsSchema.optional(),
  })
  .meta({
    id: 'PublicKeyCredentialCreationOptions',
    ref: 'PublicKeyCredentialCreationOptions',
    description: `Options for creating a new public key credential. ${see(
      'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialcreationoptions',
    )}`,
  });

export type PublicKeyCredentialCreationOptions = z.infer<
  typeof PublicKeyCredentialCreationOptionsSchema
>;
