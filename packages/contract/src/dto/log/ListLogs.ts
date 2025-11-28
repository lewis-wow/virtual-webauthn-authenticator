import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
} from '@repo/pagination/zod-validation';

import { LogDtoSchema } from './components/LogDtoSchema';

// =============================================================================
// OPERATION: LIST
// =============================================================================

// -------------------------------------
// Inputs
// -------------------------------------

export const ListLogsQuerySchema = PaginationRequestMetaSchema;

// -------------------------------------
// Outputs
// -------------------------------------

export const ListLogsResponseSchema = PaginationResultSchema(LogDtoSchema);
