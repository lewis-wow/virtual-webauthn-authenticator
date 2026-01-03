import { z } from 'zod';

import type { OrderByDirection } from '../enums/OrderByDirection';
import { StringToIntCodecSchema } from './codecs/StringToIntCodecSchema';
import { OrderByDirectionSchema } from './enums/OrderByDirectionSchema';

export const PaginationRequestMetaSchema = <T extends z.ZodEnum>(keysEnum: T) =>
  z
    .object({
      cursor: z.uuid().optional(),
      limit: StringToIntCodecSchema.optional(),
      orderBy: z.record(keysEnum, OrderByDirectionSchema).optional(),
    })
    .optional();

export type PaginationRequestMeta<T extends string> = {
  cursor?: string;
  limit?: string | number;
  orderBy?: Record<T, OrderByDirection>;
};
