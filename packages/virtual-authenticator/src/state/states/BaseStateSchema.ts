import z from 'zod';

export const BaseStateSchema = z.object({
  optionsHash: z.string(),
});

export type BaseState = z.infer<typeof BaseStateSchema>;
