import { UserVerificationRequirement } from '@repo/enums';
import type { IPublicKeyCredentialRequestOptions } from '@repo/types';
import z from 'zod';

import { AuthenticationExtensionsClientInputsSchema } from './AuthenticationExtensionsClientInputsSchema.js';
import { PublicKeyCredentialDescriptorSchema } from './PublicKeyCredentialDescriptorSchema.js';

export const PublicKeyCredentialRequestOptionsSchema = z.object({
  challenge: z.instanceof(Buffer),
  allowCredentials: z.array(PublicKeyCredentialDescriptorSchema).optional(),
  timeout: z.number().optional(),
  rpId: z.string().optional(),
  userVerification: z.nativeEnum(UserVerificationRequirement).optional(),
  extensions: AuthenticationExtensionsClientInputsSchema.optional(),
}) satisfies z.ZodType<IPublicKeyCredentialRequestOptions>;
