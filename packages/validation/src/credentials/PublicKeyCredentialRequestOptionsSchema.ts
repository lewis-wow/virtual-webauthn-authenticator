import type { IPublicKeyCredentialRequestOptions } from '@repo/types';
import z from 'zod';
import { UserVerificationRequirement } from '@repo/enums';
import { PublicKeyCredentialDescriptorSchema } from './PublicKeyCredentialDescriptorSchema.js';
import { AuthenticationExtensionsClientInputsSchema } from './AuthenticationExtensionsClientInputsSchema.js';

export const PublicKeyCredentialRequestOptionsSchema = z.object({
  challenge: z.instanceof(Buffer),
  allowCredentials: z.array(PublicKeyCredentialDescriptorSchema).optional(),
  timeout: z.number().optional(),
  rpId: z.string().optional(),
  userVerification: z.nativeEnum(UserVerificationRequirement).optional(),
  extensions: AuthenticationExtensionsClientInputsSchema.optional(),
}) satisfies z.ZodType<IPublicKeyCredentialRequestOptions>;
