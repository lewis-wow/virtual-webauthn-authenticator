import type { IPublicKeyCredentialJSON } from '@repo/types';
import z from 'zod';
import { AuthenticatorAttachment, PublicKeyCredentialType } from '@repo/enums';
import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema.js';
import { PublicKeyCredentialJSONResponseSchema } from './PublicKeyCredentialJSONResponseSchema.js';

export const PublicKeyCredentialJSONSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  type: z.nativeEnum(PublicKeyCredentialType),
  clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
  authenticatorAttachment: z.nativeEnum(AuthenticatorAttachment).nullable(),
  response: PublicKeyCredentialJSONResponseSchema,
}) satisfies z.ZodType<IPublicKeyCredentialJSON>;
