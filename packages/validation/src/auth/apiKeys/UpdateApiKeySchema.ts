import z from 'zod';

export const UpdateApiKeyParamRequestSchema = z.object({
  id: z.string(),
});

export const UpdateApiKeyBodyRequestSchema = z.object({
  name: z.string(),
  expiresIn: z.number().optional(),
});

export const UpdateApiKeyResponseSchema = z.object({});
