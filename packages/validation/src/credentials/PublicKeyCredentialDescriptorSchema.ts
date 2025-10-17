import {
  AuthenticatorTransportSchema,
  PublicKeyCredentialTypeSchema,
} from '@repo/enums';
import type { IPublicKeyCredentialDescriptor } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';

// Used to exclude existing credentials for a user
export const PublicKeyCredentialDescriptorSchema = z
  .object({
    type: PublicKeyCredentialTypeSchema,
    id: Base64URLBufferSchema.meta({ description: 'The ID of the credential.' }),
    transports: z.array(AuthenticatorTransportSchema).optional(),
  })
  .meta({
    id: 'PublicKeyCredentialDescriptor',
    description: 'Used to exclude existing credentials for a user. For more information, see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialdescriptor.',
  }) satisfies z.ZodType<IPublicKeyCredentialDescriptor>;
