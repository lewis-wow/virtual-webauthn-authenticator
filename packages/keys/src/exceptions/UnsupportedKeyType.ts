import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class UnsupportedKeyType extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly code = 'UnsupportedKeyType';
  static message = 'Unsupported key type.';
}
