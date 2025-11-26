import { z } from 'zod';

export const GetHealthcheckResponseSchema = z
  .object({
    healthy: z.literal(true),
  })
  .meta({
    id: 'GetHealthcheckResponse',
    description:
      'Response for a healthcheck, indicating the service is running.',
  });
