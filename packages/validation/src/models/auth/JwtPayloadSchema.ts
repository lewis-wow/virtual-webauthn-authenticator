import { z } from 'zod';

import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';

export const JwtPayloadSchema = JwtRegisteredClaimsSchema.extend({
  id: z.string(),
  name: z.string(),
}).meta({
  ref: 'JwtPayload',
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
