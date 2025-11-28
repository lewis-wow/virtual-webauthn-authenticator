import { z } from 'zod';

import type { SortDirection } from '../enums/SortDirection';
import { StringToIntCodecSchema } from './codecs/StringToIntCodecSchema';
import { SortDirectionSchema } from './enums/SortDirectionSchema';

export const PaginationRequestMetaSchema = <T extends z.ZodEnum>(keysEnum: T) =>
  z
    .object({
      cursor: z.uuid().optional(),
      limit: StringToIntCodecSchema.optional(),
      orderBy: z.record(keysEnum, SortDirectionSchema).optional(),
    })
    .optional();

export type PaginationRequestMeta<T extends string> = {
  cursor?: string;
  limit?: string | number;
  orderBy?: Record<T, SortDirection>;
};
