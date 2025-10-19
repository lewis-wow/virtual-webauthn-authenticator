import z from 'zod';

import { ApiKeySchema } from '../../model/ApiKeySchema';
import { DatabaseIdSchema } from '../../model/DatabaseIdSchema';

export const GetApiKeyParamRequestSchema = z.object({
  id: DatabaseIdSchema.meta({
    description: 'The ID of the API key to retrieve.',
  }),
});

export const GetApiKeyResponseSchema = ApiKeySchema.omit({
  key: true,
});
