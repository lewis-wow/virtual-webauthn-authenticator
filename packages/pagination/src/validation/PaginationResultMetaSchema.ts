import { z } from 'zod';

export const PaginationResultMetaSchema = z.discriminatedUnion('hasNext', [
  z.object({
    hasNext: z.literal(true),
    nextCursor: z.uuid(),
  }),
  z.object({
    hasNext: z.literal(false),
    nextCursor: z.null(),
  }),
]);

export type PaginationResultMeta = z.infer<typeof PaginationResultMetaSchema>;
