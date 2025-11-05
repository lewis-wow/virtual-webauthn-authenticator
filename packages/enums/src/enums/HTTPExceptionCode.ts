import z from 'zod';

import type { ValueOfEnum } from '../types';
import { HTTPStatusCode } from './HTTPStatusCode';

export const HTTPExceptionCode = {
  ...HTTPStatusCode,

  CREDENTIAL_NOT_FOUND: 'CREDENTIAL_NOT_FOUND',

  CANNOT_PARSE_JSON_WEB_KEY: 'CANNOT_PARSE_JSON_WEB_KEY',
  CANNOT_PARSE_COSE_KEY: 'CANNOT_PARSE_COSE_KEY',

  UNSUPPORTED_KTY: 'UNSUPPORTED_KTY',
} as const;

export type HTTPExceptionCode = ValueOfEnum<typeof HTTPExceptionCode>;

export const HTTPExceptionCodeSchema = z.enum(HTTPExceptionCode).meta({
  description: 'API error',
  examples: [HTTPExceptionCode.UNAUTHORIZED],
});
