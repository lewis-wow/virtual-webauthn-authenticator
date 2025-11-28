import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
} from '@repo/pagination/zod-validation';

import { AuditLogDtoSchema } from './components/AuditLogDtoSchema';

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

export const ListLogsResponseSchema = PaginationResultSchema(AuditLogDtoSchema);
