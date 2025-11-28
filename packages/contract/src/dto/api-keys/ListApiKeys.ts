import { PaginationResultSchema } from '@repo/pagination/zod-validation';

import { ApiKeyDtoSchema } from './components/ApiKeyDtoSchema';

// =============================================================================
// OPERATION: LIST
// =============================================================================

// -------------------------------------
// Outputs
// -------------------------------------

export const ListApiKeysResponseSchema =
  PaginationResultSchema(ApiKeyDtoSchema);
