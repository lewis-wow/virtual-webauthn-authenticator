import z from 'zod';

import { IsoDatetimeToDateSchema } from '../../transformers/IsoDatetimeToDateSchema';

export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable(),
  createdAt: IsoDatetimeToDateSchema,
  updatedAt: IsoDatetimeToDateSchema,
});

export type User = z.infer<typeof UserSchema>;
