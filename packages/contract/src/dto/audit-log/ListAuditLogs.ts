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

export const ListAuditLogsQuerySchema = PaginationRequestMetaSchema;

// -------------------------------------
// Outputs
// -------------------------------------

export const ListAuditLogsResponseSchema =
  PaginationResultSchema(AuditLogDtoSchema);
