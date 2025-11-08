import z from 'zod';

import { DateSchemaCodec } from '../../codecs/DateSchemaCodec';

export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserSchemaCodec = UserSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});

export type User = z.infer<typeof UserSchema>;
