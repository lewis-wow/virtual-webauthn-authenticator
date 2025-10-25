import z from 'zod';

import { ApikeySchema } from '../../../models';

export const ListApiKeysResponseSchema = z.array(
  ApikeySchema.omit({ key: true }),
);
