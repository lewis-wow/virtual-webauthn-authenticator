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
    id: z.string().meta({
      description:
        'The base64url-encoded identifier for the newly created credential.',
      examples: ['ADSUuK-3498-f-39-f-S_d_9-d-f-f-A'],
    }),
    rawId: z.string().meta({
      description:
        'The raw, base64url-encoded identifier for the newly created credential.',
      examples: ['ADSUuK-3498-f-39-f-S_d_9-d-f-f-A'],
    }),
    response: AuthenticatorAttestationResponseJSONSchema,
    authenticatorAttachment: AuthenticatorAttachmentSchema.nullable(),
    clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
    type: PublicKeyCredentialTypeSchema,
  })
  .meta({
    description:
      'The response from a registration ceremony. For more information, see https://www.w3.org/TR/webauthn/#iface-registrationresponsejson.',
  }) satisfies z.ZodType<IRegistrationResponseJSON>;
