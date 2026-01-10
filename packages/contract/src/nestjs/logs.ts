import { initContract } from '@ts-rest/core';

import {
  ListLogsQuerySchema,
  ListLogsResponseSchema,
} from '../dto/log/ListLogs';

const c = initContract();

export const logsRouter = c.router({
  list: {
    method: 'GET',
    path: '/audit-logs',
    query: ListLogsQuerySchema,
    responses: ListLogsResponseSchema,
  },
});
