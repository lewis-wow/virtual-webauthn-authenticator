import { Schema } from 'effect';

export const PaginationRequestMetaSchema = Schema.Struct({
  cursor: Schema.optional(Schema.UUID),
  limit: Schema.optional(
    Schema.Union(Schema.Number, Schema.NumberFromString).pipe(
      Schema.int(),
      Schema.nonNegative(),
    ),
  ),
});

export type PaginationRequestMeta = Schema.Schema.Type<
  typeof PaginationRequestMetaSchema
>;
