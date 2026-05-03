import { z } from 'zod';

export const GetTokenApiKeyResponseSchema = z.object({
  token: z.jwt(),
});
