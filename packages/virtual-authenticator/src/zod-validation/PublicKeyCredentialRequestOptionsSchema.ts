import z from 'zod';

import { see } from '../meta/see';
import { AuthenticationExtensionsClientInputsSchema } from './AuthenticationExtensionsClientInputsSchema';
import { ChallengeSchema } from './ChallengeSchema';
import { PublicKeyCredentialDescriptorSchema } from './PublicKeyCredentialDescriptorSchema';
import { UserVerificationRequirementSchema } from './enums/UserVerificationRequirementSchema';

/**
 * The PublicKeyCredentialRequestOptions dictionary supplies get() with the data it needs to generate an assertion.
 * Its challenge member MUST be present, while its other members are OPTIONAL.
 *
 * @see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrequestoptions
 */
export const PublicKeyCredentialRequestOptionsSchema = z
  .object({
    /**
     * This member represents a challenge that the selected authenticator signs,
     * along with other data, when producing an authentication assertion.
     */
    challenge: ChallengeSchema,
    /**
     * This OPTIONAL member contains a list of PublicKeyCredentialDescriptor
     * objects representing public key credentials acceptable to the caller,
     * in descending order of the caller’s preference
     * (the first item in the list is the most preferred credential, and so on down the list).
     */
    allowCredentials: z.array(PublicKeyCredentialDescriptorSchema).optional(),
    timeout: z.number().optional(),
    /**
     * Specifies the Relying Party ID, a unique identifier for your web application.
     * By default, the RP ID for a WebAuthn operation is set to the caller’s origin’s effective domain.
     *
     * This value must be a valid domain string that is a registrable domain suffix of,
     * or is equal to, the origin's effective domain. For example, for an origin of
     * `https://login.example.com`, the `rpId` could be `login.example.com` or `example.com`.
     *
     * @see https://w3c.github.io/webauthn/#relying-party-identifier
     */
    rpId: z.string().optional(),
    userVerification: UserVerificationRequirementSchema.optional(),
    extensions: AuthenticationExtensionsClientInputsSchema.optional(),
  })
  .meta({
    id: 'PublicKeyCredentialRequestOptions',
    ref: 'PublicKeyCredentialRequestOptions',
    description: `Options for requesting a public key credential. ${see(
      'https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrequestoptions',
    )}`,
  });

export type PublicKeyCredentialRequestOptions = z.infer<
  typeof PublicKeyCredentialRequestOptionsSchema
>;
