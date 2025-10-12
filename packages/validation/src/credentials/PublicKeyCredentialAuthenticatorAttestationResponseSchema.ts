import type { IPublicKeyCredentialAuthenticatorAttestationResponse } from '@repo/types';
import z from 'zod';
import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';
import {
  PublicKeyCredentialTypeSchema,
  AuthenticatorAttachmentSchema,
} from '../enums.js';
import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema.js';
import { AuthenticatorAttestationResponseSchema } from './AuthenticatorAttestationResponseSchema.js';

export const PublicKeyCredentialAuthenticatorAttestationResponseSchema = z.object({
    id: z.string().describe('The Base64URL-encoded credential ID.'),
    rawId: Base64URLBufferSchema,
    type: PublicKeyCredentialTypeSchema,
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
    authenticatorAttachment: AuthenticatorAttachmentSchema.nullable(),
    response: AuthenticatorAttestationResponseSchema,
  }) satisfies z.ZodType<IPublicKeyCredentialAuthenticatorAttestationResponse>;
