import { initContract } from '@ts-rest/core';
import { Schema } from 'effect';

import { ListAuditLogsResponseSchema } from '../validation/audit-log/list/ListAuditLogsResponseSchema';

const c = initContract();

export const auditLogsRouter = c.router({
  list: {
    method: 'GET',
    path: '/audit-logs',
    responses: {
      200: Schema.standardSchemaV1(ListAuditLogsResponseSchema),
    },
  },
});
