import z from 'zod';

import { BytesSchema } from '../BytesSchema';

export const AuthenticatorContextArgsSchema = z
  .object({
    selectedCredentailOptionId: z.string().optional(),
    hash: BytesSchema,
  })
  .optional();

export type AuthenticatorContextArgs = z.infer<
  typeof AuthenticatorContextArgsSchema
>;
