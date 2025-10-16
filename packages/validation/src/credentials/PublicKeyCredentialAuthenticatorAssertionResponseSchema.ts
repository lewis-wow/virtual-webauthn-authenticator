import type { IPublicKeyCredentialAuthenticatorAssertionResponse } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';
import {
  AuthenticatorAttachmentSchema,
  PublicKeyCredentialTypeSchema,
} from '../enums.js';
import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema.js';
import { AuthenticatorAssertionResponseSchema } from './AuthenticatorAssertionResponseSchema.js';

export const PublicKeyCredentialAuthenticatorAssertionResponseSchema = z.object(
  {
    id: z.string().describe('The Base64URL-encoded credential ID.'),
    rawId: Base64URLBufferSchema,
    type: PublicKeyCredentialTypeSchema,
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
    authenticatorAttachment: AuthenticatorAttachmentSchema.nullable(),
    response: AuthenticatorAssertionResponseSchema,
  },
).meta({
  description: 'The response from an authenticator for an assertion.',
}) satisfies z.ZodType<IPublicKeyCredentialAuthenticatorAssertionResponse>;
