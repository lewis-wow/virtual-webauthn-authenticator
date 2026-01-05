import z from 'zod';

import { see } from '../meta/see';
import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema';
import { AuthenticatorAssertionResponseSchema } from './AuthenticatorAssertionResponseSchema';
import { AuthenticatorAttestationResponseSchema } from './AuthenticatorAttestationResponseSchema';
import { BytesSchema } from './BytesSchema';
import { CredentialSchema } from './CredentialSchema';
import { AuthenticatorAttachmentSchema } from './enums/AuthenticatorAttachmentSchema';

/**
 * This is the primary schema for validating the incoming credential object from
 * the client during registration or authentication verification. The `response`
 * is a union type to handle both ceremonies.
 *
 * @see https://www.w3.org/TR/webauthn/#iface-publickeycredential
 */
export const PublicKeyCredentialSchema = CredentialSchema.extend({
  rawId: BytesSchema.meta({
    description: 'The raw ID of the credential.',
  }),
  response: z.union([
    AuthenticatorAttestationResponseSchema,
    AuthenticatorAssertionResponseSchema,
  ]),
  /**
   * A platform authenticator is attached using a client device-specific transport, called platform attachment,
   * and is usually not removable from the client device.
   * A public key credential bound to a platform authenticator is called a platform credential.
   *
   * A roaming authenticator is attached using cross-platform transports, called cross-platform attachment.
   * Authenticators of this class are removable from, and can "roam" between, client devices.
   * A public key credential bound to a roaming authenticator is called a roaming credential.
   *
   * NOTE: Using cross-platform, as the virtual authenticator can be used on any device using its web API.
   *
   * @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-attachment-modality
   */
  authenticatorAttachment: AuthenticatorAttachmentSchema.optional(),
  clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
}).meta({
  id: 'PublicKeyCredential',
  ref: 'PublicKeyCredential',
  description: `The primary schema for validating the incoming credential object from the client during registration or authentication verification. ${see(
    'https://www.w3.org/TR/webauthn/#iface-publickeycredential',
  )}`,
});

export type PublicKeyCredential = z.infer<typeof PublicKeyCredentialSchema>;
