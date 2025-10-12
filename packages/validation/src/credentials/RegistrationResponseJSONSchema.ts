import type { IRegistrationResponseJSON } from '@repo/types';
import z from 'zod';
import { AuthenticatorAttachment, PublicKeyCredentialType } from '@repo/enums';
import { AuthenticatorAttestationResponseJSONSchema } from './AuthenticatorAttestationResponseJSONSchema.js';
import { AuthenticationExtensionsClientOutputsSchema } from './AuthenticationExtensionsClientOutputsSchema.js';

export const RegistrationResponseJSONSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  response: AuthenticatorAttestationResponseJSONSchema,
  authenticatorAttachment: z.nativeEnum(AuthenticatorAttachment).nullable(),
  clientExtensionResults: AuthenticationExtensionsClientOutputsSchema,
  type: z.nativeEnum(PublicKeyCredentialType),
}) satisfies z.ZodType<IRegistrationResponseJSON>;
