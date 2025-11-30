import z from 'zod';

import { LogActionSchema } from './enums/LogActionSchema';
import { LogEntitySchema } from './enums/LogEntitySchema';

export const LogSchema = z.object({
  id: z.uuid(),

  action: LogActionSchema,
  entity: LogEntitySchema,
  entityId: z.uuid().nullable(),

  userId: z.uuid(),
  apiKeyId: z.uuid().nullable(),
  apiKeyIdReference: z.uuid().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),

  metadata: z.record(z.string(), z.unknown()).nullable(),
});

export type Log = z.infer<typeof LogSchema>;
