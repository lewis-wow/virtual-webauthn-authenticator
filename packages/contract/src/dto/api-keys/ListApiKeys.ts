import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
  SortKeysSchema,
} from '@repo/pagination/validation';

import { ApiKeyDtoSchema } from './components/ApiKeyDtoSchema';

export const ListApiKeysQuerySchema =
  PaginationRequestMetaSchema(SortKeysSchema);

export const ListApiKeysResponseSchema =
  PaginationResultSchema(ApiKeyDtoSchema);
