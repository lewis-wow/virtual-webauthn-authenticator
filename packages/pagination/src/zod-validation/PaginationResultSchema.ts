import { z } from 'zod';

import {
  PaginationResultMetaSchema,
  type PaginationResultMeta,
} from './PaginationResultMetaSchema';

export const PaginationResultSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: PaginationResultMetaSchema,
  });

export type PaginationResult<T> = {
  data: T[];
  meta: PaginationResultMeta;
};
