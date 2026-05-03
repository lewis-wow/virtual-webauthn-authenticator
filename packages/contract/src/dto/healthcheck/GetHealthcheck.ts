import { HttpStatusCode } from '@repo/http';
import z from 'zod';

export const GetHealthcheckResponseSchema = {
  [HttpStatusCode.OK_200]: z.object({
    healthy: z.literal(true),
  }),
};
