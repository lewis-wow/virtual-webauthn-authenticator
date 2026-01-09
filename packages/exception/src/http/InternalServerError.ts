import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class InternalServerError extends Exception {
  static status = HttpStatusCode.INTERNAL_SERVER_ERROR;
  static readonly name = 'InternalServerError';
  static message = 'Internal Server Error.';
}
