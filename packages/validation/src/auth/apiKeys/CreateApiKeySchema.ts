import z from 'zod';

export const CreateApiKeySchema = z.object({
  name: z.string(),
  expiresIn: z.number().optional(),
});
