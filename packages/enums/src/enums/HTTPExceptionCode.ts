import z from 'zod';

import type { ValueOfEnum } from '../types.js';

export const HTTPExceptionCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

export type HTTPExceptionCode = ValueOfEnum<typeof HTTPExceptionCode>;

export const HTTPExceptionCodeSchema = z.enum(HTTPExceptionCode).meta({
  description: 'API error',
  examples: [HTTPExceptionCode.UNAUTHORIZED],
});
