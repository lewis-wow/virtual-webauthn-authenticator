import type { IPublicKeyCredentialUserEntity } from '@repo/types';
import z from 'zod';
import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';

// Represents the user creating the credential
export const PublicKeyCredentialUserEntitySchema = z.object({
  id: Base64URLBufferSchema,
  name: z.string(),
  displayName: z.string(),
}) satisfies z.ZodType<IPublicKeyCredentialUserEntity>;
