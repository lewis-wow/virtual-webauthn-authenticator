import { HttpStatusCode } from '@repo/http';

import { Exception } from './Exception';

export class RequestValidationFailed extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly name = 'RequestValidationFailed';
  static message = 'Request validation failed.';
}
