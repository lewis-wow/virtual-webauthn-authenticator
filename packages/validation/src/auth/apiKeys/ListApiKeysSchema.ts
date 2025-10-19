import z from 'zod';

import { ApiKeySchema } from '../../model/ApiKeySchema';

export const ListApiKeysResponseSchema = z.array(
  ApiKeySchema.omit({
    key: true,
  }),
);
