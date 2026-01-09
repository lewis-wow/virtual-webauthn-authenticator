import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class UnknownException extends Exception {
  static status = HttpStatusCode.INTERNAL_SERVER_ERROR;
  static readonly name = 'UnknownException';
  static message = 'Unknown exception.';
}
