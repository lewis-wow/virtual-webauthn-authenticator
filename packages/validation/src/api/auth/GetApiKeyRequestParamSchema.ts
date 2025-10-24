import z from 'zod';

export const GetApiKeyRequestParamSchema = z
  .object({
    id: z.uuid(),
  })
  .meta({
    ref: 'GetApiKeyRequestParam',
  });
