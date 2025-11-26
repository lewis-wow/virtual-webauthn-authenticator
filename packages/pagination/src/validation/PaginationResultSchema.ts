import { Schema } from 'effect';

import { PaginationResultMetaSchema } from './PaginationResultMetaSchema';

export const PaginationResultSchema = <A, I, R>(
  itemSchema: Schema.Schema<A, I, R>,
) =>
  Schema.Struct({
    data: Schema.Array(itemSchema),
    meta: PaginationResultMetaSchema,
  });

export type PaginationResult<T> = {
  data: ReadonlyArray<T>;
  meta: Schema.Schema.Type<typeof PaginationResultMetaSchema>;
};
