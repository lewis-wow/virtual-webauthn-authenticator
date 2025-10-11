import type { IPublicKeyCredential } from '@repo/types';
import z from 'zod';
import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';
import { AuthenticatorAttachmentSchema } from '../enums/AuthenticatorAttachmentSchema.js';
import { PublicKeyCredentialTypeSchema } from '../enums/PublicKeyCredentialTypeSchema.js';
import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema.js';
import { AuthenticatorAssertionResponseSchema } from './AuthenticatorAssertionResponseSchema.js';
import { AuthenticatorAttestationResponseSchema } from './AuthenticatorAttestationResponseSchema.js';

/**
 * Corresponds to: `IPublicKeyCredential`
 *
 * This is the primary schema for validating the incoming credential object from
 * the client during registration or authentication verification. The `response`
 * is a union type to handle both ceremonies.
 */
export const PublicKeyCredentialSchema: z.ZodType<IPublicKeyCredential> =
  z.object({
    id: z.string().describe('The Base64URL-encoded credential ID.'),
    rawId: Base64URLBufferSchema,
    type: PublicKeyCredentialTypeSchema,
    response: z.union([
      AuthenticatorAttestationResponseSchema,
      AuthenticatorAssertionResponseSchema,
    ]),
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
    authenticatorAttachment: AuthenticatorAttachmentSchema.nullable(),
  });
