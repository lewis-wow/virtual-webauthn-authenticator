import z from 'zod';

import { ApikeySchema } from '../../../models/auth/ApiKeySchema';

export const ListApiKeysResponseSchema = z.array(
  ApikeySchema.omit({ keyHash: true }),
);
