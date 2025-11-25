import { PaginationResultSchema } from '@repo/utils/validation';
import type { Schema } from 'effect';

import { AuditSchema } from './AuditSchema';

export const AuditPaginationSchema = PaginationResultSchema(AuditSchema);

export type AuditPagination = Schema.Schema.Type<typeof AuditPaginationSchema>;
