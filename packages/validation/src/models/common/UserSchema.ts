import z from 'zod';

import { IsoDatetimeToDateCodecSchema } from '../../codecs/IsoDatetimeToDateCodecSchema';

export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const UserCodecSchema = UserSchema.extend({
  createdAt: IsoDatetimeToDateCodecSchema,
  updatedAt: IsoDatetimeToDateCodecSchema,
});
