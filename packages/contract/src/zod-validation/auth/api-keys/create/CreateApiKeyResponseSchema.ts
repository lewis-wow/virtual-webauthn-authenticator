import z from 'zod';

import { ApiKeyDtoSchema } from '../../ApiKeyDtoSchema';

export const CreateApiKeyResponseSchema = z.object({
  apiKey: ApiKeyDtoSchema,
  plaintextKey: z.string(),
});
