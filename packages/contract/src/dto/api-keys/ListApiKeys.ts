import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
} from '@repo/pagination/zod-validation';

import { ApiKeyDtoSchema } from './components/ApiKeyDtoSchema';

// =============================================================================
// OPERATION: LIST
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const ListApiKeysQuerySchema = PaginationRequestMetaSchema;

// -------------------------------------
// Outputs
// -------------------------------------

export const ListApiKeysResponseSchema =
  PaginationResultSchema(ApiKeyDtoSchema);
