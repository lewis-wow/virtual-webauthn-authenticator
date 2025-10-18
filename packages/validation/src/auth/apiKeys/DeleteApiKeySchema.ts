import z from 'zod';

export const DeleteApiKeyParamRequestSchema = z.object({
  id: z.string(),
});

export const DeleteApiKeyResponseSchema = z.object({});
