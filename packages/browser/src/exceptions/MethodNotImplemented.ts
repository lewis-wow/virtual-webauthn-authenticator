import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class MethodNotImplemented extends Exception {
  static status = HttpStatusCode.NOT_IMPLEMENTED;
  static readonly name = 'MethodNotImplemented';
  static message = 'Method not implemented';
}
