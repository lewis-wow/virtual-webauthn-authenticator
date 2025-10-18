import z from 'zod';

export const CreateApiKeyBodyRequestSchema = z.object({
  name: z.string(),
  expiresIn: z.number().optional(),
});

export const CreateApiKeyResponseSchema = z.object({});
