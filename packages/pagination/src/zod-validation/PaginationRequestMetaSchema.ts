import { z } from 'zod';

import { StringToIntCodecSchema } from './codecs/StringToIntCodecSchema';

export const PaginationRequestMetaSchema = z.object({
  cursor: z.uuid(),
  limit: StringToIntCodecSchema,
});

export type PaginationRequestMeta = z.infer<typeof PaginationRequestMetaSchema>;
