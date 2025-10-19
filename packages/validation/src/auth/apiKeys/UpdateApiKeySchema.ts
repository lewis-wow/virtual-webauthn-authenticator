import z from 'zod';

import { ApiKeySchema } from '../../model/ApiKeySchema';
import { DatabaseIdSchema } from '../../model/DatabaseIdSchema';
import { CreateApiKeyBodyRequestSchema } from './CreateApiKeySchema';

export const UpdateApiKeyParamRequestSchema = z.object({
  id: DatabaseIdSchema.meta({
    description: 'The ID of the API key to update.',
  }),
});

export const UpdateApiKeyBodyRequestSchema = CreateApiKeyBodyRequestSchema;

export const UpdateApiKeyResponseSchema = ApiKeySchema.omit({
  key: true,
});
