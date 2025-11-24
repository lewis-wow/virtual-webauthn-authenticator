import { Schema } from 'effect';

import { see } from '../meta/see';
import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema';
import { AuthenticatorAssertionResponseSchema } from './AuthenticatorAssertionResponseSchema';
import { AuthenticatorAttestationResponseSchema } from './AuthenticatorAttestationResponseSchema';
import { BytesSchema } from './BytesSchema';
import { CredentialSchema } from './CredentialSchema';

/**
 * This is the primary schema for validating the incoming credential object from
 * the client during registration or authentication verification. The `response`
 * is a union type to handle both ceremonies.
 *
 * @see https://www.w3.org/TR/webauthn/#iface-publickeycredential
 */
export const PublicKeyCredentialSchema = Schema.extend(
  CredentialSchema,
  Schema.Struct({
    rawId: BytesSchema.annotations({
      description: 'The raw ID of the credential.',
    }),
    response: Schema.Union(
      AuthenticatorAttestationResponseSchema,
      AuthenticatorAssertionResponseSchema,
    ),
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
  }),
).annotations({
  identifier: 'PublicKeyCredential',
  title: 'PublicKeyCredential',
  ref: 'PublicKeyCredential',
  description: `The primary schema for validating the incoming credential object from the client during registration or authentication verification. ${see(
    'https://www.w3.org/TR/webauthn/#iface-publickeycredential',
  )}`,
});

export type PublicKeyCredential = Schema.Schema.Type<
  typeof PublicKeyCredentialSchema
>;
