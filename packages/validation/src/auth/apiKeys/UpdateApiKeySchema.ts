import z from 'zod';

export const UdpateApiKeySchema = z.object({
  name: z.string(),
  expiresIn: z.number().optional(),
});
