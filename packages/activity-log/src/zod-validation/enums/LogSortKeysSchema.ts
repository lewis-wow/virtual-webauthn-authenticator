import z from 'zod';

import { LogSortKeys } from '../../enums/LogSortKeys';

export const LogSortKeysSchema = z.enum(LogSortKeys).meta({
  id: 'LogSortKeys',
  examples: [LogSortKeys.CREATED_AT],
});
