import z from 'zod';

export const GetApiKeyParamRequestSchema = z.object({
  id: z.string(),
});

export const GetApiKeyResponseSchema = z.object({});
