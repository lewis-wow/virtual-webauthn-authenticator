import { initContract } from '@ts-rest/core';
import { Schema } from 'effect';

import { ListAuditLogsRequestQuerySchema } from '../validation/audit-log/list/ListAuditLogsRequestQuerySchema';
import { ListAuditLogsResponseSchema } from '../validation/audit-log/list/ListAuditLogsResponseSchema';

const c = initContract();

export const auditLogsRouter = c.router({
  list: {
    method: 'GET',
    path: '/audit-logs',
    query: Schema.standardSchemaV1(ListAuditLogsRequestQuerySchema),
    responses: {
      200: Schema.standardSchemaV1(ListAuditLogsResponseSchema),
    },
  },
});
