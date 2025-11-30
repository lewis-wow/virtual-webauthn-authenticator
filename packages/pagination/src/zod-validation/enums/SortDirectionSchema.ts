import z from 'zod';

import { SortDirection } from '../../enums/SortDirection';

export const SortDirectionSchema = z.enum(SortDirection).meta({
  description: 'SortDirection',
  examples: [SortDirection.ASC],
});
