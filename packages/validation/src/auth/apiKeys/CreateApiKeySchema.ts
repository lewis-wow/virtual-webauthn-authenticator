import z from 'zod';

import { ApiKeySchema } from '../../model/ApiKeySchema';

export const CreateApiKeyBodyRequestSchema = z.object({
  name: z.string().meta({ description: 'The name of the API key.' }),
  expiresIn: z.number().optional().meta({
    description:
      'The number of days until the API key expires. If not provided, the API key will not expire.',
  }),
});

export const CreateApiKeyResponseSchema = ApiKeySchema;
