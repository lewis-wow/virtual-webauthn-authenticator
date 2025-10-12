import { AuthenticatorTransport, PublicKeyCredentialType } from '@repo/enums';
import type { IPublicKeyCredentialDescriptor } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';

// Used to exclude existing credentials for a user
export const PublicKeyCredentialDescriptorSchema = z.object({
  type: z.enum(PublicKeyCredentialType),
  id: Base64URLBufferSchema,
  transports: z.array(z.enum(AuthenticatorTransport)).optional(),
}) satisfies z.ZodType<IPublicKeyCredentialDescriptor>;
