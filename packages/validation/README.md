# @repo/validation

A small set of reusable Zod building blocks for concepts that show up in multiple places but aren't part of any single API contract, so they don't belong in `@repo/contract`'s request/response schemas. It exists so validation logic like "is this a valid Uint8Array", "is this a bare origin with no path", or "is this a duration object" is written and tested once instead of being redefined ad hoc wherever it's needed.

It provides `BytesSchema` (validates a `Uint8Array`), `OriginSchema` (validates a URL string that is exactly an origin, no trailing path), `DurationSchema` (a structured `{ years, months, ..., seconds }` duration object), an `EnvironmentSchema` enum, and codecs (`BytesSchemaCodec`, `DateSchemaCodec`) that both validate and transcode a wire format (e.g. a base64url string) into its in-memory representation (e.g. a `Uint8Array`) and back, for use in schemas that need to serialize binary or date data over JSON.
