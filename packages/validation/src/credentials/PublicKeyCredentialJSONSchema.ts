import {
  AuthenticatorAttachmentSchema,
  PublicKeyCredentialTypeSchema,
} from '@repo/enums';
import type { IPublicKeyCredentialJSON } from '@repo/types';
import z from 'zod';

import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema.js';
import { PublicKeyCredentialJSONResponseSchema } from './PublicKeyCredentialJSONResponseSchema.js';

export const PublicKeyCredentialJSONSchema = z
  .object({
    id: z.string(),
    rawId: z.string(),
    type: PublicKeyCredentialTypeSchema,
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
    authenticatorAttachment: AuthenticatorAttachmentSchema.nullable(),
    response: PublicKeyCredentialJSONResponseSchema,
  })
  .meta({
    id: 'PublicKeyCredentialJSON',
    description: 'A public key credential.',
  }) satisfies z.ZodType<IPublicKeyCredentialJSON>;
