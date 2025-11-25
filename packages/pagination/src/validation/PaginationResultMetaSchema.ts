import { Schema } from 'effect';

export const PaginationResultMetaSchema = Schema.Union(
  Schema.Struct({
    hasNext: Schema.Literal(true),
    nextCursor: Schema.UUID,
  }),
  Schema.Struct({
    hasNext: Schema.Literal(false),
    nextCursor: Schema.Null,
  }),
);

export type PaginationResultMeta = Schema.Schema.Type<
  typeof PaginationResultMetaSchema
>;
