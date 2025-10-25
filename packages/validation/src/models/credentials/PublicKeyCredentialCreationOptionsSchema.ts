import { AttestationSchema } from '@repo/enums';
import z from 'zod';

import { see } from '../../meta/see';
import { AuthenticatorSelectionCriteriaSchema } from './AuthenticatorSelectionCriteriaSchema.js';
import { ChallengeSchema } from './ChallengeSchema.js';
import { PublicKeyCredentialDescriptorSchema } from './PublicKeyCredentialDescriptorSchema.js';
import { PublicKeyCredentialParametersSchema } from './PublicKeyCredentialParametersSchema.js';
import { PublicKeyCredentialRpEntitySchema } from './PublicKeyCredentialRpEntitySchema.js';
import { PublicKeyCredentialUserEntitySchema } from './PublicKeyCredentialUserEntitySchema.js';

/**
 * Zod schema for WebAuthn's PublicKeyCredentialCreationOptions.
 * This is sent from the server to the client to initiate passkey registration.
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialcreationoptions
 */
export const PublicKeyCredentialCreationOptionsSchema = z
  .object({
    rp: PublicKeyCredentialRpEntitySchema,
    user: PublicKeyCredentialUserEntitySchema,
    challenge: ChallengeSchema,
    pubKeyCredParams: z.array(PublicKeyCredentialParametersSchema).min(1),
    timeout: z.number().optional(),
    excludeCredentials: z.array(PublicKeyCredentialDescriptorSchema).optional(),
    authenticatorSelection: AuthenticatorSelectionCriteriaSchema.optional(),
    attestation: AttestationSchema.optional(),
    // Extensions can be complex; a generic record is often sufficient for validation
    extensions: z.record(z.string(), z.unknown()).optional(),
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
