import { HTTPExceptionCodeSchema } from '@repo/enums';
import z from 'zod';

export const HTTPExceptionSchema = z.object({
  message: z.string(),
  code: HTTPExceptionCodeSchema,
});

export type HTTPException = z.infer<typeof HTTPExceptionSchema>;
