import z from 'zod';

export const GetTokenApiKeysResponseSchema = z.object({
  token: z.jwt(),
});
