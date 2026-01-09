import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class TypeAssertionError extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly name = 'TypeAssertionError';
  static message = 'Type mismatch';
}
