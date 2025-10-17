import {
  AuthenticatorAttachmentSchema,
  PublicKeyCredentialTypeSchema,
} from '@repo/enums';
import type { IRegistrationResponseJSON } from '@repo/types';
import z from 'zod';

import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema.js';
import { AuthenticatorAttestationResponseJSONSchema } from './AuthenticatorAttestationResponseJSONSchema.js';

export const RegistrationResponseJSONSchema = z
  .object({
    id: z.string(),
    rawId: z.string(),
    response: AuthenticatorAttestationResponseJSONSchema,
    authenticatorAttachment: AuthenticatorAttachmentSchema.nullable(),
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
    type: PublicKeyCredentialTypeSchema,
  })
  .meta({
    description: 'The response from a registration ceremony.',
  }) satisfies z.ZodType<IRegistrationResponseJSON>;
