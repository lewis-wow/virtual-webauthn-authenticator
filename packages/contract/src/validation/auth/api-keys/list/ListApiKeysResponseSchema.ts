import { ApiKeySchema } from '@repo/auth/validation';
import { Schema } from 'effect';

export const ListApiKeysResponseSchema = Schema.mutable(
  Schema.Array(ApiKeySchema),
).annotations({
  identifier: 'ListApiKeysResponse',
  title: 'ListApiKeysResponse',
});
