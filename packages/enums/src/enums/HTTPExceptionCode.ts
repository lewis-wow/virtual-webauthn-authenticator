import z from 'zod';

import type { ValueOfEnum } from '../types';

export const HTTPExceptionCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',

  CREDENTIAL_NOT_FOUND: 'CREDENTIAL_NOT_FOUND',
} as const;

export type HTTPExceptionCode = ValueOfEnum<typeof HTTPExceptionCode>;

export const HTTPExceptionCodeSchema = z.enum(HTTPExceptionCode).meta({
  description: 'API error',
  examples: [HTTPExceptionCode.UNAUTHORIZED],
});
