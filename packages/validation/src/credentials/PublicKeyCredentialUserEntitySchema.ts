import type { IPublicKeyCredentialUserEntity } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';

// Represents the user creating the credential
export const PublicKeyCredentialUserEntitySchema = z.object({
  id: Base64URLBufferSchema.meta({ description: 'The user handle for the credential.' }),
  name: z.string(),
  displayName: z.string(),
}).meta({
  description: 'Represents the user creating the credential. For more information, see https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialuserentity.',
}) satisfies z.ZodType<IPublicKeyCredentialUserEntity>;
