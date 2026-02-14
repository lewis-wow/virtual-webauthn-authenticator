import z from 'zod';

export const BaseStateSchema = z.object({});

export type BaseState = z.infer<typeof BaseStateSchema>;
