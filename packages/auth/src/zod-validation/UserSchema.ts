import z from 'zod';

export const UserSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    emailVerified: z.boolean().default(false).optional(),

    image: z.string().nullable(),

    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .meta({
    identifier: 'User',
    title: 'User',
  });

export type User = z.infer<typeof UserSchema>;
