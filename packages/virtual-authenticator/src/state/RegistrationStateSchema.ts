import z from 'zod';

export const RegistrationStateSchema = z.object({
  up: z.boolean().optional(),
  uv: z.boolean().optional(),
});

export type RegistrationState = z.infer<typeof RegistrationStateSchema>;

export const RegistrationStateWithTokenSchema = RegistrationStateSchema.extend({
  current: z.string(),
});

export type RegistrationStateWithToken = z.infer<
  typeof RegistrationStateWithTokenSchema
>;
