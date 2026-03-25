import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
  SortKeysSchema,
} from '@repo/pagination/validation';

import { ApiKeyDtoSchema } from './components/ApiKeyDtoSchema';

// =============================================================================
// OPERATION: LIST
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const ListApiKeysQuerySchema =
  PaginationRequestMetaSchema(SortKeysSchema);

// -------------------------------------
// Outputs
// -------------------------------------

export const ListApiKeysResponseSchema =
  PaginationResultSchema(ApiKeyDtoSchema);
