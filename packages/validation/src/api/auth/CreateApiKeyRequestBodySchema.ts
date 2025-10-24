import z from 'zod';

export const CreateApiKeyRequestBodySchema = z
  .object({
    name: z.string(),
  })
  .meta({
    id: 'CreateApiKeyRequestBody',
  });
