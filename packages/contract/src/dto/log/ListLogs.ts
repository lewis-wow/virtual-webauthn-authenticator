import { HttpStatusCode } from '@repo/http';
import {
  PaginationRequestMetaSchema,
  PaginationResultSchema,
  SortKeysSchema,
} from '@repo/pagination/validation';

import { LogDtoSchema } from './components/LogDtoSchema';

export const ListLogsQuerySchema = PaginationRequestMetaSchema(SortKeysSchema);

export const ListLogsResponseSchema = {
  [HttpStatusCode.OK_200]: PaginationResultSchema(LogDtoSchema),
};
