import z from 'zod';

import { BytesSchemaCodec } from '../../codecs/BytesSchemaCodec';
import { see } from '../../meta/see';
import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema';
import { AuthenticatorAssertionResponseSchema } from './AuthenticatorAssertionResponseSchema';
import { AuthenticatorAttestationResponseSchema } from './AuthenticatorAttestationResponseSchema';
import { CredentialSchema } from './CredentialSchema';

/**
 * This is the primary schema for validating the incoming credential object from
 * the client during registration or authentication verification. The `response`
 * is a union type to handle both ceremonies.
 *
 * @see https://www.w3.org/TR/webauthn/#iface-publickeycredential
 */
export const PublicKeyCredentialSchema = CredentialSchema.extend({
  rawId: BytesSchemaCodec.meta({
    description: 'The raw ID of the credential.',
  }),
  response: z.union([
    AuthenticatorAttestationResponseSchema,
    AuthenticatorAssertionResponseSchema,
  ]),
  clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
}).meta({
  id: 'PublicKeyCredential',
  ref: 'PublicKeyCredential',
  description: `The primary schema for validating the incoming credential object from the client during registration or authentication verification. ${see(
    'https://www.w3.org/TR/webauthn/#iface-publickeycredential',
  )}`,
});

export type PublicKeyCredential = z.infer<typeof PublicKeyCredentialSchema>;
