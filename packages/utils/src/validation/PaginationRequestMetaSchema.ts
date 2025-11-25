import { Schema } from 'effect';

export const PaginationRequestMetaSchema = Schema.Struct({
  cursor: Schema.optional(Schema.UUID),
  limit: Schema.optional(Schema.Int.pipe(Schema.nonNegative())),
});

export type PaginationRequestMeta = Schema.Schema.Type<
  typeof PaginationRequestMetaSchema
>;
