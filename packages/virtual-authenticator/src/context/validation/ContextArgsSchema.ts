import z from 'zod';

import { ContextTokenPayloadSchema } from './ContextSchema';

export const ContextArgsSchema = ContextTokenPayloadSchema.extend({
  token: z.string(),
}).optional();

export type ContextArgs = z.infer<typeof ContextArgsSchema>;
