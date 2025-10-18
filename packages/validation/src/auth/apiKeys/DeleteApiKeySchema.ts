import z from 'zod';

export const DeleteApiKeySchema = z.object({
  id: z.string(),
});
