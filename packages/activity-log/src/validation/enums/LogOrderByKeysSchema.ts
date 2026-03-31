import z from 'zod';

import { LogOrderByKeys } from '../../enums/LogOrderByKeys';

export const LogOrderByKeysSchema = z.enum(LogOrderByKeys).meta({
  id: 'LogOrderByKeys',
  examples: [LogOrderByKeys.CREATED_AT],
});
