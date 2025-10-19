import z from 'zod';

import { DatabaseIdSchema } from '../../model/DatabaseIdSchema';

export const DeleteApiKeyParamRequestSchema = z.object({
  id: DatabaseIdSchema.meta({
    description: 'The ID of the API key to delete.',
  }),
});

export const DeleteApiKeyResponseSchema = z.object({
  success: z.literal(true),
});
