import {
  AuthenticatorAttachmentSchema,
  PublicKeyCredentialTypeSchema,
} from '@repo/enums';
import type { IPublicKeyCredentialAuthenticatorAttestationResponse } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';
import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema.js';
import { AuthenticatorAttestationResponseSchema } from './AuthenticatorAttestationResponseSchema.js';

export const PublicKeyCredentialAuthenticatorAttestationResponseSchema = z
  .object({
    id: z.string().describe('The Base64URL-encoded credential ID.'),
    rawId: Base64URLBufferSchema.meta({ description: 'The raw ID of the credential.' }),
    type: PublicKeyCredentialTypeSchema,
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
    authenticatorAttachment: AuthenticatorAttachmentSchema.nullable(),
    response: AuthenticatorAttestationResponseSchema,
  })
  .meta({
    id: 'PublicKeyCredentialAuthenticatorAttestationResponse',
    description: 'The response from an authenticator for an attestation. For more information, see https://www.w3.org/TR/webauthn/#iface-pk-cred-auth-attestation-resp.',
  }) satisfies z.ZodType<IPublicKeyCredentialAuthenticatorAttestationResponse>;
