import z from 'zod';

export const AuthenticationStateSchema = z.object({
  up: z.boolean().optional(),
  uv: z.boolean().optional(),
  credentialId: z.string().optional(),
});
export type AuthenticationState = z.infer<typeof AuthenticationStateSchema>;

export const AuthenticationStateWithTokenSchema =
  AuthenticationStateSchema.extend({
    current: z.string(),
  });

export type AuthenticationStateWithToken = z.infer<
  typeof AuthenticationStateWithTokenSchema
>;
