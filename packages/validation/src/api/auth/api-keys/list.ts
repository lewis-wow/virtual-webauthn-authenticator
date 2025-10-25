import z from 'zod';

import { ApikeySchema } from '../../../models';

export const ListApiKeyResponseSchema = z.array(
  ApikeySchema.omit({ key: true }),
);
