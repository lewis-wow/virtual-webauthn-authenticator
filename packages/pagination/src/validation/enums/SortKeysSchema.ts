import z from 'zod';

import { SortKeys } from '../../enums/SortKeys';

export const SortKeysSchema = z.enum(SortKeys).meta({
  description: 'SortKeys',
  examples: [SortKeys.CREATED_AT],
});
