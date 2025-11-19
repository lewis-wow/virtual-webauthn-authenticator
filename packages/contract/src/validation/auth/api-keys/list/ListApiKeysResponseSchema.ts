import { ApiKeySchema } from '@repo/auth/validation';
import { Schema } from 'effect';

export const ListApiKeysResponseSchema = Schema.Array(ApiKeySchema).annotations(
  {
    identifier: 'ListApiKeysResponse',
  },
);
