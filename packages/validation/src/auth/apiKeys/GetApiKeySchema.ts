import z from 'zod';

export const GetApiKeySchema = z.object({
  id: z.string(),
});
