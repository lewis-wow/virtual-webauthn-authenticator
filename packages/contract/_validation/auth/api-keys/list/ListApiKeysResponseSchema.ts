import { ApiKeySchema } from '@repo/auth/validation';
import { PaginationResultSchema } from '@repo/pagination/validation';

export const ListApiKeysResponseSchema = PaginationResultSchema(
  ApiKeySchema,
).annotations({
  identifier: 'ListApiKeysResponse',
  title: 'ListApiKeysResponse',
});
