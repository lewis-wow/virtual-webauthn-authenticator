import z from 'zod';

import { VirtualAuthenticatorUserVerificationTypeSchema } from './enums/VirtualAuthenticatorUserVerificationTypeSchema';

export const AuthenticatorMetaArgsSchema = z.object({
  userId: z.string(),
  virtualAuthenticatorId: z.string(),
  apiKeyId: z.string().nullable(),

  userVerificationEnabled: z.boolean(),
  userPresenceEnabled: z.boolean(),
  userVerificationType: VirtualAuthenticatorUserVerificationTypeSchema,
});

export type AuthenticatorMetaArgs = z.infer<typeof AuthenticatorMetaArgsSchema>;
