import { HttpStatusCode } from '@repo/http';

import { Exception } from './Exception';

export class RequestValidationFailed extends Exception {
  static status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'RequestValidationFailed';
  static message = 'Request validation failed.';
}
