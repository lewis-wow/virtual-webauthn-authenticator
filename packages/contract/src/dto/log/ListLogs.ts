import { HttpStatusCode } from '@repo/http';
import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
  SortKeysSchema,
} from '@repo/pagination/zod-validation';

import { LogDtoSchema } from './components/LogDtoSchema';

// =============================================================================
// OPERATION: LIST
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const ListLogsQuerySchema = PaginationRequestMetaSchema(SortKeysSchema);

// -------------------------------------
// Outputs
// -------------------------------------

export const ListLogsResponseSchema = {
  [HttpStatusCode.OK_200]: PaginationResultSchema(LogDtoSchema),
};
