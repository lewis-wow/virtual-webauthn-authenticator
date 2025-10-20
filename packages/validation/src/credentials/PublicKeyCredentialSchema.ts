import type { IPublicKeyCredential } from '@repo/types';
import z from 'zod';

import { see } from '../meta/see.js';
import { Base64URLBufferSchema } from '../transformers/Base64URLBufferSchema.js';
import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema.js';
import { AuthenticatorAssertionResponseSchema } from './AuthenticatorAssertionResponseSchema.js';
import { AuthenticatorAttestationResponseSchema } from './AuthenticatorAttestationResponseSchema.js';
import { CredentialSchema } from './CredentialSchema.js';

/**
 * This is the primary schema for validating the incoming credential object from
 * the client during registration or authentication verification. The `response`
 * is a union type to handle both ceremonies.
 *
 * @see https://www.w3.org/TR/webauthn/#iface-publickeycredential
 */
export const PublicKeyCredentialSchema = CredentialSchema.extend({
  rawId: Base64URLBufferSchema.meta({
    description: 'The raw ID of the credential.',
  }),
  response: z.union([
    AuthenticatorAttestationResponseSchema,
    AuthenticatorAssertionResponseSchema,
  ]),
  clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
}).meta({
  id: 'PublicKeyCredential',
  description: `The primary schema for validating the incoming credential object from the client during registration or authentication verification. ${see('https://www.w3.org/TR/webauthn/#iface-publickeycredential')}`,
}) satisfies z.ZodType<IPublicKeyCredential>;
